defmodule Eventer.Message do
  use Ecto.Schema
  import Ecto.Changeset

  alias Eventer.{User, Event}

  schema "messages" do
    field(:text, :string)
    field(:is_bot, :boolean, default: false)
    belongs_to(:user, User)
    belongs_to(:event, Event)
    timestamps()
  end

  def changeset(event, params \\ %{}) do
    event
    |> cast(params, [:text, :user_id, :event_id, :is_bot])
    |> validate_required(:text, message: "Text can't be blank")
    |> assoc_constraint(:event, message: "Event does not exist")
    |> validate_identity()
  end

  defp validate_identity(changeset) do
    is_bot = get_field(changeset, :is_bot)

    if is_bot do
      changeset
    else
      changeset
      |> validate_required(:user_id, message: "User has to be specified")
      |> assoc_constraint(:user, message: "User does not exist")
    end
  end
end
