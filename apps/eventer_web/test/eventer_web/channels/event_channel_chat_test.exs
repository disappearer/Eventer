defmodule EventerWeb.EventChannelChatTest do
  use EventerWeb.ChannelCase

  alias EventerWeb.{IdHasher, EventChannel}
  alias Eventer.Persistence.Messages
  alias Eventer.{Event, Message}

  import Mox

  # Make sure mocks are verified when the test exits
  setup :verify_on_exit!

  describe "Event chat" do
    @tag :notifications_enabled
    @tag authorized: 2
    test "'chat_shout' inserts message into DB", %{
      connections: connections
    } do
      EventerWeb.NotifierMock
      |> expect(:notify_absent_participants, fn _, _, _ -> nil end)

      [creator, joiner] = connections
      event = insert_event(%{creator: creator.user})
      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, joiner_socket} =
        subscribe_and_join(
          joiner.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      ref = push(joiner_socket, "join_event", %{})
      assert_reply(ref, :ok, %{})

      message = "Hell World!"
      ref = push(joiner_socket, "chat_shout", %{text: message})
      assert_reply(ref, :ok, %{message: reply_message})

      %{id: id, text: text, event_id: event_id, user_id: user_id} =
        reply_message

      assert id !== nil
      assert text === message
      assert event_id === event.id
      assert user_id === joiner.user.id

      [_, %Message{text: text, event_id: event_id, user_id: user_id}] =
        Messages.get_messages(event.id)

      assert text === message
      assert event_id === event.id
      assert user_id === joiner.user.id
    end

    @tag :notifications_enabled
    @tag authorized: 2
    test "'chat_shout' is broadcasted", %{
      connections: connections
    } do
      EventerWeb.NotifierMock
      |> expect(:notify_absent_participants, fn _, _, _ -> nil end)

      [creator, joiner] = connections
      event = insert_event(%{creator: creator.user})
      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, joiner_socket} =
        subscribe_and_join(
          joiner.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      ref = push(joiner_socket, "join_event", %{})
      assert_reply(ref, :ok, %{})
      assert_broadcast("chat_shout", _)

      message = "Hell World!"
      ref = push(joiner_socket, "chat_shout", %{text: message})
      assert_reply(ref, :ok, %{})

      [
        _,
        %Message{
          id: id,
          inserted_at: inserted_at
        }
      ] = Messages.get_messages(event.id)

      assert_broadcast("chat_shout", payload)

      assert payload === %{
               id: id,
               user_id: joiner.user.id,
               text: message,
               is_bot: false,
               inserted_at: inserted_at
             }
    end

    @tag :notifications_enabled
    @tag authorized: 2
    test "'get_chat_messages' gets event chat messages", %{
      connections: connections
    } do
      EventerWeb.NotifierMock
      |> expect(:notify_absent_participants, fn _, _, _ -> nil end)

      [creator, joiner] = connections
      event = insert_event(%{creator: creator.user})

      messages =
        insert_list(13, :message, %{
          event: event,
          user: creator.user
        })

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, joiner_socket} =
        subscribe_and_join(
          joiner.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      ref = push(joiner_socket, "join_event", %{})
      assert_reply(ref, :ok, %{})

      ref = push(joiner_socket, "get_chat_messages", %{})
      assert_reply(ref, :ok, %{messages: reply_messages})

      join_shout = List.last(reply_messages)
      message_maps = Enum.map(messages, &Messages.to_map/1)
      assert reply_messages === message_maps ++ [join_shout]
    end

    @tag :notifications_enabled
    @tag authorized: 2
    test "'get_chat_messages_after' the last message received", %{
      connections: connections
    } do
      EventerWeb.NotifierMock
      |> expect(:notify_absent_participants, fn _, _, _ -> nil end)

      [creator, joiner] = connections
      event = insert_event(%{creator: creator.user})

      insert_list(3, :message, %{
        event: event,
        user: creator.user
      })

      before_second_insert = Timex.now()

      Process.sleep(1000)

      new_messages =
        insert_list(3, :message, %{
          event: event,
          user: creator.user
        })

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, joiner_socket} =
        subscribe_and_join(
          joiner.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      ref = push(joiner_socket, "join_event", %{})
      assert_reply(ref, :ok, %{})

      ref =
        push(joiner_socket, "get_chat_messages_after", %{
          after: before_second_insert
        })

      assert_reply(ref, :ok, %{messages: reply_messages})

      join_shout = List.last(reply_messages)
      message_maps = Enum.map(new_messages, &Messages.to_map/1)
      assert reply_messages === message_maps ++ [join_shout]
    end

    @tag authorized: 2
    test "'get_chat_messages' gets event chat messages for non-participants", %{
      connections: connections
    } do
      [creator, joiner] = connections
      event = insert_event(%{creator: creator.user})

      messages =
        insert_list(13, :message, %{
          event: event,
          user: creator.user
        })

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, joiner_socket} =
        subscribe_and_join(
          joiner.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      ref = push(joiner_socket, "get_chat_messages", %{})
      assert_reply(ref, :ok, %{messages: reply_messages})

      message_maps = Enum.map(messages, &Messages.to_map/1)
      assert reply_messages === message_maps
    end

    @tag :notifications_enabled
    @tag authorized: 3
    test "'chat_shout' notifies absent participants only once", %{
      connections: connections
    } do
      [creator, joiner1, joiner2] = connections

      creator_id = creator.user.id
      joiner1_id = joiner1.user.id
      event = insert_event(%{creator: creator.user})

      event_id_hash = IdHasher.encode(event.id)

      event_id = event.id
      notification_title = "\"#{event.title}\" is active!"
      notification_body = "Someone wrote in the chat."

      # 1st user joins event
      {:ok, _, joiner_socket1} =
        subscribe_and_join(
          joiner1.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      EventerWeb.NotifierMock
      |> expect(:notify_absent_participants, 1, fn [^creator_id], _, _ ->
        nil
      end)

      ref = push(joiner_socket1, "join_event", %{})
      assert_reply(ref, :ok, %{})

      # 2nd user joins event
      {:ok, _, joiner_socket2} =
        subscribe_and_join(
          joiner2.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      ref = push(joiner_socket2, "join_event", %{})
      assert_reply(ref, :ok, %{})

      # 1st user leaves page
      Process.unlink(joiner_socket1.channel_pid)
      :ok = close(joiner_socket1)

      EventerWeb.NotifierMock
      |> expect(:notify_absent_participants, 1, fn [^joiner1_id],
                                                   %Event{id: ^event_id},
                                                   %{
                                                     title: ^notification_title,
                                                     body: ^notification_body
                                                   } ->
        nil
      end)

      message = "Hell World!"
      ref = push(joiner_socket2, "chat_shout", %{text: message})
      assert_reply(ref, :ok, _)
      ref = push(joiner_socket2, "chat_shout", %{text: message})
      assert_reply(ref, :ok, _)
      ref = push(joiner_socket2, "chat_shout", %{text: message})
      assert_reply(ref, :ok, _)
      ref = push(joiner_socket2, "chat_shout", %{text: message})
      assert_reply(ref, :ok, _)

      # creator joins event page
      {:ok, _, creator_socket} =
        subscribe_and_join(
          creator.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      EventerWeb.NotifierMock
      |> expect(:notify_absent_participants, 0, fn _, _, _ ->
        nil
      end)

      # 2nd user shout
      ref = push(joiner_socket2, "chat_shout", %{text: message})
      assert_reply(ref, :ok, _)

      # creator leaves page
      Process.unlink(creator_socket.channel_pid)
      leave(creator_socket)

      EventerWeb.NotifierMock
      |> expect(:notify_absent_participants, 1, fn [^creator_id],
                                                   %Event{id: ^event_id},
                                                   %{
                                                     title: ^notification_title,
                                                     body: ^notification_body
                                                   } ->
        nil
      end)

      # 2nd user shout
      ref = push(joiner_socket2, "chat_shout", %{text: message})
      assert_reply(ref, :ok, payload)
      ref = push(joiner_socket2, "chat_shout", %{text: message})
      assert_reply(ref, :ok, _)
    end

    @tag authorized: 1
    test "'chat_is_typing' is broadcasted", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert_event(%{creator: user})
      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      ref = push(socket, "chat_is_typing", %{})
      assert_reply(ref, :ok, %{})

      assert_broadcast("chat_is_typing", payload)

      assert payload === %{user_id: user.id}
    end
  end
end
