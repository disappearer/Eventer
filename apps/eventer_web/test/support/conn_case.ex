defmodule EventerWeb.ConnCase do
  @moduledoc """
  This module defines the test case to be used by
  tests that require setting up a connection.

  Such tests rely on `Phoenix.ConnTest` and also
  import other functionality to make it easier
  to build common data structures and query the data layer.

  Finally, if the test case interacts with the database,
  we enable the SQL sandbox, so changes done to the database
  are reverted at the end of every test. If you are using
  PostgreSQL, you can even run database tests asynchronously
  by setting `use EventerWeb.ConnCase, async: true`, although
  this option is not recommended for other databases.
  """

  use ExUnit.CaseTemplate

  alias EventerWeb.Guardian

  using do
    quote do
      # Import conveniences for testing with connections
      use Phoenix.ConnTest
      alias EventerWeb.Router.Helpers, as: Routes

      import EventerWeb.Factory
      import EventerWeb.ConnCase

      # The default endpoint for testing
      @endpoint EventerWeb.Endpoint

      setup tags do
        if tags[:authorized] do
          user = insert(:user)

          {:ok, token, _} =
            Guardian.encode_and_sign(user, %{}, token_type: :access)

          conn =
            build_conn()
            |> put_req_header("accept", "application/json")
            |> put_req_header("authorization", "Bearer #{token}")

          {:ok, %{conn: conn, authorized_user: user}}
        else
          {:ok, %{conn: build_conn()}}
        end
      end
    end
  end

  setup _tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Eventer.Repo)
    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end

  def diff(struct1, struct2, ignored_keys \\ []) do
    map1 = struct1 |> KitchenSink.Struct.to_map() |> Map.drop(ignored_keys)
    map2 = struct2 |> KitchenSink.Struct.to_map() |> Map.drop(ignored_keys)

    delta =
      KitchenSink.Map.diff(map1, map2)
      |> Enum.sort()

    {delta, map1, map2}
  end
end
