defmodule Eventer.Poll do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false
  embedded_schema do
    field(:question, :string)
    field(:fixed, :boolean, default: false)
    field(:multiple_votes, :boolean, default: false)
    field(:votes, :map, default: %{})

    embeds_many :options, Option, on_replace: :delete do
      field(:text, :string)
    end
  end

  def changeset(poll, params \\ %{}) do
    poll
    |> cast(params, [:question, :fixed, :multiple_votes, :votes])
    |> cast_embed(:options, with: &option_changeset/2)
    |> validate_required(:fixed,
      message: "Question type (fixed) must be provided"
    )
    |> validate_length(:question, min: 3, max: 100)
    |> validate_options()
  end

  defp option_changeset(option, params) do
    option
    |> cast(params, [:text])
    |> validate_required(:text, message: "Option text must be provided")
  end

  defp validate_options(changeset) do
    options = get_field(changeset, :options)

    cond do
      has_duplicate(options) ->
        add_error(changeset, :options, "Cannot have duplicate options")

      less_than_two(options) ->
        validate_required(changeset, :question,
          message: "Question must be provided if there are less than 2 options"
        )

      true ->
        changeset
    end
  end

  defp has_duplicate(options) do
    options
    |> Enum.frequencies_by(&Map.get(&1, :text))
    |> Enum.any?(fn {_, frequency} -> frequency > 1 end)
  end

  defp less_than_two(options), do: length(options) < 2
end
