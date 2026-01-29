// Aplikačná logika - oddelená od DOM
import { createTodo, toggleComplete, updateTodo } from './Todo.js';
import { createProject } from './Project.js';
import { saveToStorage, loadFromStorage } from './Storage.js';

// Stav aplikácie
let projects = [];
let todos = [];
let activeProjectId = 'default';
let currentSort = 'none';

// Inicializácia aplikácie
export const initApp = () => {
    const savedData = loadFromStorage();

    if (savedData) {
        projects = savedData.projects || [];
        todos = savedData.todos || [];
        activeProjectId = savedData.activeProjectId || 'default';
    }

    // Vytvor default projekt ak neexistuje
    if (!projects.find((p) => p.isDefault)) {
        const defaultProject = createProject('Inbox', true);
        projects.push(defaultProject);
        saveState();
    }

    return { projects, todos, activeProjectId };
};

// Uloženie stavu
const saveState = () => {
    saveToStorage({ projects, todos, activeProjectId });
};

// === PROJEKTY ===
export const getProjects = () => [...projects];

export const getActiveProject = () => projects.find((p) => p.id === activeProjectId);

export const setActiveProject = (projectId) => {
    activeProjectId = projectId;
    saveState();
    return activeProjectId;
};

export const addProject = (name) => {
    const project = createProject(name);
    projects.push(project);
    saveState();
    return project;
};

export const deleteProject = (projectId) => {
    // Nemôžeme zmazať default projekt
    const project = projects.find((p) => p.id === projectId);
    if (project?.isDefault) return false;

    // Zmaž projekt a všetky jeho todos
    projects = projects.filter((p) => p.id !== projectId);
    todos = todos.filter((t) => t.projectId !== projectId);

    // Nastav aktívny projekt na default ak bol zmazaný aktívny
    if (activeProjectId === projectId) {
        activeProjectId = 'default';
    }

    saveState();
    return true;
};

// === TODOS ===
export const getTodos = (projectId = null) => {
    if (projectId) {
        return todos.filter((t) => t.projectId === projectId);
    }
    return [...todos];
};

export const getTodosByActiveProject = () => {
    return todos.filter((t) => t.projectId === activeProjectId);
};

export const getTodoById = (todoId) => {
    return todos.find((t) => t.id === todoId);
};

export const addTodo = (title, description, dueDate, priority, notes = '') => {
    const todo = {
        ...createTodo(title, description, dueDate, priority, notes),
        projectId: activeProjectId,
    };
    todos.push(todo);
    saveState();
    return todo;
};

export const deleteTodo = (todoId) => {
    todos = todos.filter((t) => t.id !== todoId);
    saveState();
};

export const editTodo = (todoId, updates) => {
    todos = todos.map((t) => (t.id === todoId ? updateTodo(t, updates) : t));
    saveState();
    return getTodoById(todoId);
};

export const toggleTodoComplete = (todoId) => {
    todos = todos.map((t) => (t.id === todoId ? toggleComplete(t) : t));
    saveState();
    return getTodoById(todoId);
};

export const moveTodoToProject = (todoId, projectId) => {
    todos = todos.map((t) => (t.id === todoId ? { ...t, projectId } : t));
    saveState();
};

// === ŠTATISTIKY ===
export const getProjectStats = (projectId) => {
    const projectTodos = todos.filter((t) => t.projectId === projectId);
    return {
        total: projectTodos.length,
        completed: projectTodos.filter((t) => t.completed).length,
        pending: projectTodos.filter((t) => !t.completed).length,
    };
};

// === SORTING FUNKCIE ===
export const sortTodosByDueDate = (todoList) => {
    return [...todoList].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
};

export const sortTodosByPriority = (todoList) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return [...todoList].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

export const setCurrentSort = (sortType) => {
    currentSort = sortType;
};

export const getCurrentSort = () => {
    return currentSort;
};

export const getSortedTodosByActiveProject = () => {
    let projectTodos = getTodosByActiveProject();

    const pending = projectTodos.filter((t) => !t.completed);
    const completed = projectTodos.filter((t) => t.completed);

    let sortedPending = pending;

    if (currentSort === 'dueDate') {
        sortedPending = sortTodosByDueDate(pending);
    } else if (currentSort === 'priority') {
        sortedPending = sortTodosByPriority(pending);
    }
    return [...sortedPending, ...completed];
};
