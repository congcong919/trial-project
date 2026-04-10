function TodoList({ todos, onDeleteTodo, onToggleComplete }) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li className="todo-item">
        <div className="todo-left">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo._id, todo.completed)}
          />
          <span className={todo.completed ? "completed" : ""}>{todo.text}</span>
        </div>
  
        <button className="delete-btn" onClick={() => onDeleteTodo(todo._id)}>
          Delete
        </button>
      </li>
      ))}
    </ul>
  );
}

export default TodoList;