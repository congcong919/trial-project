import { useState } from "react";

function TodoForm({ onAddTodo }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      return;
    }

    onAddTodo(trimmedValue);
    setInputValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="input-section">
      <input
        type="text"
        placeholder="Enter a task..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSubmit}>Add</button>
    </div>
  );
}

export default TodoForm;