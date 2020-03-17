defmodule EventerWeb.EventChannelAddDecisionTest do
  use EventerWeb.ChannelCase

  alias EventerWeb.{IdHasher, EventChannel}
  alias Eventer.Persistence.Events

  describe "Decision add" do
    @tag authorized: 1
    test "'add_decision' success", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert(:event, %{creator: user})
      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      event = Events.get_event(event.id) |> Events.to_map()

      decision_data = %{
        decision: %{
          title: "Da Decision",
          description: "Da Description"
        }
      }

      ref = push(socket, "add_decision", decision_data)

      assert_reply(ref, :ok, %{})

      updated_event = Events.get_event(event.id) |> Events.to_map()

      {[
         {[:decisions], '', [new_decision]}
       ], _, _} = diff(event, updated_event)

      assert new_decision.creator_id === user.id
      assert new_decision.event_id === event.id
      assert new_decision.title === decision_data.decision.title
      assert new_decision.description === decision_data.decision.description
    end

    @tag authorized: 1
    test "'decision_updated' is broadcasted", %{
      connections: [%{user: user, socket: socket}]
    } do
      event = insert(:event, %{creator: user})
      event_id_hash = IdHasher.encode(event.id)

      {:ok, _, socket} =
        subscribe_and_join(
          socket,
          EventChannel,
          "event:#{event_id_hash}"
        )

      decision_data = %{
        decision: %{
          title: "Da Decision",
          description: "Da Description"
        }
      }

      push(socket, "add_decision", decision_data)

      assert_broadcast("decision_added", %{decision: new_decision})

      assert new_decision.id !== nil
      assert new_decision.creator_id === user.id
      assert new_decision.event_id === event.id
      assert new_decision.title === decision_data.decision.title
      assert new_decision.description === decision_data.decision.description
    end
  end
end
