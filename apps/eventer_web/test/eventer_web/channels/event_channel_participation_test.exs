defmodule EventerWeb.EventChannelParticipationTest do
  use EventerWeb.ChannelCase

  alias EventerWeb.{IdHasher, EventChannel}
  alias Eventer.Persistence.{Events, Users}
  alias Eventer.Repo

  import Mox

  describe "Event participation" do
    @tag authorized: 2
    test "'join_event' adds user to event participants", %{
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

      participants =
        event |> Repo.preload(:participants) |> Map.get(:participants)

      assert participants === [creator.user, joiner.user]
    end

    @tag authorized: 2
    test "'user_joined' is broadcasted", %{connections: connections} do
      [creator, joiner] = connections
      event = insert_event(%{creator: creator.user})
      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, joiner_socket} =
        subscribe_and_join(
          joiner.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      push(joiner_socket, "join_event", %{})
      assert_broadcast("user_joined", payload)
      assert payload === %{user: Users.to_map(joiner.user)}

      assert_broadcast("chat_shout", payload)
      assert payload.is_bot === true

      assert payload.text ===
               "#{joiner.user.name} has joined \"#{event.title}\"."
    end

    @tag authorized: 2
    test "'leave_event' moves user from participants to ex_participants", %{
      connections: connections
    } do
      EventerWeb.NotifierMock
      |> expect(:notify_absent_participants, fn _, _, _ -> nil end)

      [creator, joiner] = connections
      event = insert_event(%{creator: creator.user})
      {:ok, _} = Events.join(event.id, joiner.user.id)
      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, joiner_socket} =
        subscribe_and_join(
          joiner.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      ref = push(joiner_socket, "leave_event", %{})
      assert_reply(ref, :ok, %{})

      event = Events.get_event(event.id)

      assert event.participants === [creator.user]
      assert event.ex_participants === [joiner.user]
    end

    @tag authorized: 2
    test "'user_left' is broadcasted", %{connections: connections} do
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

      push(joiner_socket, "join_event", %{})
      assert_broadcast("user_joined", payload)
      assert_broadcast("chat_shout", _)

      push(joiner_socket, "leave_event", %{})
      assert_broadcast("user_left", payload)
      assert payload === %{userId: joiner.user.id}

      assert_broadcast("chat_shout", payload)
      assert payload.is_bot === true
      assert payload.text === "#{joiner.user.name} has left \"#{event.title}\"."
    end

    @tag authorized: 2
    test "'join_event' is the only message allowed for non-participants", %{
      connections: connections
    } do
      [creator, joiner] = connections

      event = insert_event(%{creator: creator.user})
      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, joiner_socket} =
        subscribe_and_join(
          joiner.socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      ref =
        push(joiner_socket, "update_event", %{
          event: %{"title" => "New Title", "description" => "New Description"}
        })

      assert_reply(ref, :error, %{errors: errors})

      assert errors === %{
               permissions: "This action is not allowed for non-participants"
             }
    end
  end
end
