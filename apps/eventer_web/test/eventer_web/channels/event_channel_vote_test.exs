defmodule EventerWeb.EventChannelVoteTest do
  use EventerWeb.ChannelCase

  alias EventerWeb.{IdHasher, EventChannel}
  alias Eventer.{Decision, Repo}
  alias Eventer.Persistence.Decisions

  import Mox

  describe "Vote" do
    @tag authorized: 2
    test "'vote' success", %{
      connections: [
        %{user: user1, socket: socket1},
        %{user: user2, socket: socket2}
      ]
    } do
      EventerWeb.NotifierMock
      |> expect(:notify_absent_participants, fn _, _, _ -> nil end)

      event = insert_event(%{creator: user1})
      decision = insert(:decision, %{event: event, creator: user1})
      decision = Repo.get(Decision, decision.id)

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket1} =
        subscribe_and_join(
          socket1,
          EventChannel,
          "event:#{event_id_hash}"
        )

      {:ok, _, socket2} =
        subscribe_and_join(
          socket2,
          EventChannel,
          "event:#{event_id_hash}"
        )

      push(socket2, "join_event", %{})

      [option1 | _] = decision.poll.options

      # first user vote
      ref =
        push(socket1, "vote", %{
          decision_id: decision.id,
          custom_option: nil,
          options: [option1.id]
        })

      assert_reply(ref, :ok, %{})

      %{poll: db_poll} = Repo.get(Decision, decision.id)
      assert db_poll.votes === %{Integer.to_string(user1.id) => [option1.id]}

      # second user vote
      ref =
        push(socket2, "vote", %{
          decision_id: decision.id,
          custom_option: nil,
          options: [option1.id]
        })

      assert_reply(ref, :ok, %{})

      %{poll: db_poll} = Repo.get(Decision, decision.id)

      assert db_poll.votes === %{
               Integer.to_string(user1.id) => [option1.id],
               Integer.to_string(user2.id) => [option1.id]
             }
    end

    @tag authorized: 1
    test "'vote' is broadcasted", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert_event(%{creator: user})
      decision = insert(:decision, %{event: event, creator: user})
      decision = Repo.get(Decision, decision.id)

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      [option1 | _] = decision.poll.options

      push(socket, "vote", %{
        decision_id: decision.id,
        custom_option: nil,
        options: [option1.id]
      })

      assert_broadcast("user_voted", %{
        user_id: voter_id,
        decision_id: decision_id,
        custom_option: nil,
        options: options
      })

      assert voter_id === user.id
      assert options === [option1.id]

      assert_broadcast("chat_shout", payload)
      assert payload.is_bot === true

      assert payload.text ===
               "#{user.name} voted in the \"#{decision.title}\" decision poll."
    end

    @tag authorized: 1
    test "'vote' custom option success", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert_event(%{creator: user})
      decision = insert(:decision, %{event: event, creator: user})
      decision = Repo.get(Decision, decision.id)

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      option_text = "New Option"

      ref =
        push(socket, "vote", %{
          decision_id: decision.id,
          custom_option: %{text: option_text},
          options: []
        })

      assert_reply(ref, :ok, %{})

      %{poll: db_poll} = Repo.get(Decision, decision.id)

      new_option =
        Enum.find(db_poll.options, fn option -> option.text === option_text end)

      assert db_poll.votes === %{Integer.to_string(user.id) => [new_option.id]}
    end

    @tag authorized: 1
    test "'vote' custom option is broadcasted", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert_event(%{creator: user})
      decision = insert(:decision, %{event: event, creator: user})
      decision = Repo.get(Decision, decision.id)

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      option_text = "New Option"

      ref =
        push(socket, "vote", %{
          decision_id: decision.id,
          custom_option: %{text: option_text},
          options: []
        })

      assert_reply(ref, :ok, %{})

      %{poll: db_poll} = Repo.get(Decision, decision.id) |> Decisions.to_map()

      new_option =
        Enum.find(db_poll.options, fn option -> option.text === option_text end)

      assert_broadcast("user_voted", %{
        user_id: voter_id,
        decision_id: decision_id,
        custom_option: custom_option,
        options: options
      })

      assert voter_id === user.id

      assert custom_option.id === new_option.id
      assert options === [custom_option.id]
    end

    @tag authorized: 1
    test "'vote' multiple success", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert_event(%{creator: user})
      poll = build(:poll, %{multiple_answers_enabled: true})
      decision = insert(:decision, %{event: event, creator: user, poll: poll})
      decision = Repo.get(Decision, decision.id)

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      [option1 | [option2 | _]] = decision.poll.options

      ref =
        push(socket, "vote", %{
          decision_id: decision.id,
          custom_option: nil,
          options: [option1.id, option2.id]
        })

      assert_reply(ref, :ok, %{})

      %{poll: db_poll} = Repo.get(Decision, decision.id)

      assert db_poll.votes === %{
               Integer.to_string(user.id) => [option1.id, option2.id]
             }

      assert_broadcast("user_voted", %{
        user_id: voter_id,
        decision_id: decision_id,
        custom_option: custom_option,
        options: options
      })

      assert voter_id === user.id
      assert options === [option1.id, option2.id]
    end

    @tag authorized: 1
    test "'vote' multiple with custom option success", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert_event(%{creator: user})
      poll = build(:poll, %{multiple_answers_enabled: true})
      decision = insert(:decision, %{event: event, creator: user, poll: poll})
      decision = Repo.get(Decision, decision.id)

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      [option1 | _] = decision.poll.options

      option_text = "New Option"

      ref =
        push(socket, "vote", %{
          decision_id: decision.id,
          custom_option: %{text: option_text},
          options: [option1.id]
        })

      assert_reply(ref, :ok, %{})

      %{poll: db_poll} = Repo.get(Decision, decision.id)

      new_option =
        Enum.find(db_poll.options, fn option -> option.text === option_text end)

      assert db_poll.votes === %{
               Integer.to_string(user.id) => [new_option.id, option1.id]
             }
    end

    @tag authorized: 1
    test "'vote' multiple fails if not enabled", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert_event(%{creator: user})
      poll = build(:poll, %{multiple_answers_enabled: false})
      decision = insert(:decision, %{event: event, creator: user, poll: poll})
      decision = Repo.get(Decision, decision.id)

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      [option1 | [option2 | _]] = decision.poll.options

      ref =
        push(socket, "vote", %{
          decision_id: decision.id,
          custom_option: nil,
          options: [option1.id, option2.id]
        })

      assert_reply(ref, :error, %{errors: errors})

      assert errors === %{vote: "Voting for multiple options is disabled"}
    end

    @tag authorized: 1
    test "'vote' overwrites previous votes", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert_event(%{creator: user})
      decision = insert(:decision, %{event: event, creator: user})
      decision = Repo.get(Decision, decision.id)

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      [option1 | [option2 | _]] = decision.poll.options

      # first vote
      ref =
        push(socket, "vote", %{
          decision_id: decision.id,
          custom_option: nil,
          options: [option1.id]
        })

      assert_reply(ref, :ok, %{})

      %{poll: db_poll} = Repo.get(Decision, decision.id)

      assert db_poll.votes === %{Integer.to_string(user.id) => [option1.id]}

      # second vote
      ref =
        push(socket, "vote", %{
          decision_id: decision.id,
          custom_option: nil,
          options: [option2.id]
        })

      assert_reply(ref, :ok, %{})

      %{poll: db_poll} = Repo.get(Decision, decision.id)

      assert db_poll.votes === %{Integer.to_string(user.id) => [option2.id]}
    end

    @tag authorized: 1
    test "'vote' custom option fails if same as existing", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert_event(%{creator: user})
      decision = insert(:decision, %{event: event, creator: user})
      decision = Repo.get(Decision, decision.id)

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      [option | _] = decision.poll.options

      ref =
        push(socket, "vote", %{
          decision_id: decision.id,
          custom_option: %{text: option.text},
          options: []
        })

      assert_reply(ref, :error, %{errors: errors})
      assert errors === %{customOption: "Answer already exists"}
    end

    @tag authorized: 1
    test "'vote' custom option fails if fixed poll", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert_event(%{creator: user})
      poll = build(:poll, %{custom_answer_enabled: false})
      decision = insert(:decision, %{event: event, creator: user, poll: poll})
      decision = Repo.get(Decision, decision.id)

      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      option_text = "New Option"

      ref =
        push(socket, "vote", %{
          decision_id: decision.id,
          custom_option: %{text: option_text},
          options: []
        })

      assert_reply(ref, :error, %{errors: errors})

      assert errors === %{vote: "Poll fixed - custom option not possible"}
    end
  end
end
