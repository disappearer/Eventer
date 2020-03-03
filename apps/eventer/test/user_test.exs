defmodule UserTest do
  use Eventer.DataCase
  import Ecto.Query

  # doctest Eventer

  alias Eventer.{User, Repo}
  alias Eventer.Persistence.Users

  describe "User" do
    @tag :wip
    test "insert success" do
      count_query = from(u in User, select: count(u.id))
      before_count = Repo.one(count_query)

      {:ok, _item} =
        Users.insert_user(%{
          email: "user@example.com",
          display_name: "Test User"
        })

      assert Repo.one(count_query) == before_count + 1
    end

    test "insert fails when no email" do
      {:error, changeset} = Users.insert_user(%{display_name: "Test User"})

      assert Keyword.get(changeset.errors, :email) ===
               {"Email must be specified", [validation: :required]}
    end

    test "insert fails when no display name" do
      {:error, changeset} = Users.insert_user(%{email: "user@example.com"})

      assert Keyword.get(changeset.errors, :display_name) ===
               {"Display name must be specified", [validation: :required]}
    end

    test "insert fails when email not unique" do
      Users.insert_user(%{
        email: "user1@example.com",
        display_name: "Test User"
      })

      {:error, changeset} =
        Users.insert_user(%{
          email: "user1@example.com",
          display_name: "Test User1"
        })

      {message, _} = Keyword.get(changeset.errors, :email)
      assert message === "Email already taken"
    end

    test "insert fails when display name not unique" do
      Users.insert_user(%{
        email: "user1@example.com",
        display_name: "Test User"
      })

      {:error, changeset} =
        Users.insert_user(%{
          email: "user2@example.com",
          display_name: "Test User"
        })

      {message, _} = Keyword.get(changeset.errors, :display_name)
      assert message === "Display name already taken"
    end

    test "get by email" do
      email = "user@example.com"
      {:ok, user} =
        Users.insert_user(%{
          email: email,
          display_name: "Test User"
        })

      assert Users.get_by_email(email) === user
    end
  end
end
