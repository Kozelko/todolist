// Factory function pre vytvorenie todo položky
export const createTodo = (title, description, dueDate, priority, notes = '', checklist = []) => {
    return {
        id: Date.now().toString(),
        title,
        description,
        dueDate,
        priority, // 'low', 'medium', 'high'
        notes,
        checklist, // [{id, text, completed}]
        completed: false,
        createdAt: new Date().toISOString(),
    };
};

// Pomocné funkcie pre prácu s todo
export const toggleComplete = (todo) => {
    return { ...todo, completed: !todo.completed };
};

export const updateTodo = (todo, updates) => {
    return { ...todo, ...updates };
};

export const addChecklistItem = (todo, text) => {
    const newItem = {
        id: Date.now().toString(),
        text,
        completed: false,
    };
    return {
        ...todo,
        checklist: [...todo.checklist, newItem],
    };
};

export const toggleChecklistItem = (todo, itemId) => {
    return {
        ...todo,
        checklist: todo.checklist.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item,
        ),
    };
};
