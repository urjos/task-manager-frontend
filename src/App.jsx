import { useEffect, useState } from "react";

const API = "http://localhost:3001/api/tasks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTc5NTczODQ5MiwiZXhwIjoxNzk1NzQyMDkyfQ.TrvEjRX6IhXHLI5c7A_V9cLeoqxc_2tPQdKVE_0x9MM";

  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setTasks)
      .catch(() => setError("No se pudieron cargar las tareas"))
      .finally(() => setLoading(false));
  }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return setError("No se pudo crear la tarea");
    const created = await res.json();
    setTasks((prev) => [created, ...prev]);
    setTitle("");
  }

  async function toggle(task) {
    const res = await fetch(`${API}/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ done: !task.done }),
    });
    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
      );
    }
  }

  async function remove(id) {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <main>
      <h1>Mis tareas</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea"
        />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t)}
            />
            <span style={{ textDecoration: t.done ? "line-through" : "none" }}>
              {t.title}
            </span>
            <button onClick={() => remove(t.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
