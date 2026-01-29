// DOM manipulácia - oddelená od aplikačnej logiky
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import * as App from './AppController.js';

// === POMOCNÉ FUNKCIE ===
const createElement = (tag, className = '', textContent = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
};

const clearElement = (element) => {
    element.innerHTML = '';
};

// Date formatting
const formatDueDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'dd.MM.yyyy');
};

// Farba podľa priority
const getPriorityClass = (priority) => {
    const classes = {
        low: 'priority-low',
        medium: 'priority-medium',
        high: 'priority-high',
    };
    return classes[priority] || '';
};

// === RENDEROVANIE PROJEKTOV ===
export const renderProjects = () => {
    const projectList = document.querySelector('.project-list');
    if (!projectList) return;

    clearElement(projectList);

    const projects = App.getProjects();
    const activeProject = App.getActiveProject();

    projects.forEach((project) => {
        const stats = App.getProjectStats(project.id);
        const li = createElement('li', `project-item ${project.id === activeProject?.id ? 'active' : ''}`);
        li.dataset.projectId = project.id;

        li.innerHTML = `
      <span class="project-name">${project.name}</span>
      <span class="project-count">${stats.pending}</span>
      ${!project.isDefault ? '<button class="btn-delete-project" title="Zmazať projekt">×</button>' : ''}
    `;

        projectList.appendChild(li);
    });

    attachProjectListeners();
};

// === RENDEROVANIE TODOS ===
export const renderTodos = () => {
    const todoList = document.querySelector('.todo-list');
    if (!todoList) return;

    clearElement(todoList);

    const todos = App.getSortedTodosByActiveProject();
    const activeProject = App.getActiveProject();
    const currentSort = App.getCurrentSort();

    // Hlavička s názvom a sort selectom
    const headerWrapper = createElement('div', 'todo-list-header-wrapper');

    const header = createElement('h2', 'todo-list-header', activeProject?.name || 'Todos');
    headerWrapper.appendChild(header);

    // Sort select
    const sortSelect = createElement('select', 'sort-select');
    sortSelect.innerHTML = `
        <option value="none" ${currentSort === 'none' ? 'selected' : ''}>No sorting</option>
        <option value="priority" ${currentSort === 'priority' ? 'selected' : ''}>By priority</option>
        <option value="dueDate" ${currentSort === 'dueDate' ? 'selected' : ''}>By due date</option>
    `;
    sortSelect.addEventListener('change', (e) => {
        App.setCurrentSort(e.target.value);
        renderTodos();
    });
    headerWrapper.appendChild(sortSelect);

    todoList.appendChild(headerWrapper);

    if (todos.length === 0) {
        const emptyMessage = createElement('p', 'empty-message', 'No tasks in this project');
        todoList.appendChild(emptyMessage);
        return;
    }

    // Zoznam todos
    const ul = createElement('ul', 'todos');

    todos.forEach((todo) => {
        const li = createElement(
            'li',
            `todo-item ${todo.completed ? 'completed' : ''} ${getPriorityClass(todo.priority)}`,
        );
        li.dataset.todoId = todo.id;

        const isOverdue = todo.dueDate && isPast(new Date(todo.dueDate)) && !todo.completed;

        li.innerHTML = `
      <div class="todo-main">
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
        <span class="todo-title">${todo.title}</span>
        <span class="todo-due-date ${isOverdue ? 'overdue' : ''}">${formatDueDate(todo.dueDate)}</span>
        <div class="todo-actions">
          <button class="btn-expand" title="Details">▼</button>
          <button class="btn-delete" title="Delete">×</button>
        </div>
      </div>
      <div class="todo-details hidden">
        <p class="todo-description">${todo.description || 'No description'}</p>
        <p class="todo-notes">${todo.notes || ''}</p>
        <button class="btn-edit">Edit</button>
      </div>
    `;

        ul.appendChild(li);
    });

    todoList.appendChild(ul);
    attachTodoListeners();
};

// === MODÁLNE OKNÁ ===
export const showAddTodoModal = () => {
    const modal = document.querySelector('.modal-add-todo');
    if (modal) {
        modal.classList.remove('hidden');
        modal.querySelector('input[name="title"]')?.focus();
    }
};

export const hideAddTodoModal = () => {
    const modal = document.querySelector('.modal-add-todo');
    if (modal) {
        modal.classList.add('hidden');
        modal.querySelector('form')?.reset();
    }
};

export const showAddProjectModal = () => {
    const modal = document.querySelector('.modal-add-project');
    if (modal) {
        modal.classList.remove('hidden');
        modal.querySelector('input[name="name"]')?.focus();
    }
};

export const hideAddProjectModal = () => {
    const modal = document.querySelector('.modal-add-project');
    if (modal) {
        modal.classList.add('hidden');
        modal.querySelector('form')?.reset();
    }
};

export const showEditTodoModal = (todoId) => {
    const modal = document.querySelector('.modal-edit-todo');
    const todo = App.getTodoById(todoId);

    if (modal && todo) {
        // Vyplň formulár aktuálnymi hodnotami
        modal.querySelector('#edit-todoId').value = todo.id;
        modal.querySelector('#edit-title').value = todo.title;
        modal.querySelector('#edit-description').value = todo.description || '';
        modal.querySelector('#edit-dueDate').value = todo.dueDate || '';
        modal.querySelector('#edit-priority').value = todo.priority || 'medium';
        modal.querySelector('#edit-notes').value = todo.notes || '';

        modal.classList.remove('hidden');
        modal.querySelector('#edit-title')?.focus();
    }
};

export const hideEditTodoModal = () => {
    const modal = document.querySelector('.modal-edit-todo');
    if (modal) {
        modal.classList.add('hidden');
        modal.querySelector('form')?.reset();
    }
};

// === EVENT LISTENERS ===
const attachProjectListeners = () => {
    document.querySelectorAll('.project-item').forEach((item) => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete-project')) {
                const projectId = item.dataset.projectId;
                if (confirm('Are you sure you want to delete this project?')) {
                    App.deleteProject(projectId);
                    renderProjects();
                    renderTodos();
                }
            } else {
                App.setActiveProject(item.dataset.projectId);
                renderProjects();
                renderTodos();
            }
        });
    });
};

const attachTodoListeners = () => {
    document.querySelectorAll('.todo-item').forEach((item) => {
        const todoId = item.dataset.todoId;

        // Checkbox
        item.querySelector('.todo-checkbox')?.addEventListener('change', () => {
            App.toggleTodoComplete(todoId);
            renderTodos();
            renderProjects(); // Update project counts
        });

        // Expand/Collapse
        item.querySelector('.btn-expand')?.addEventListener('click', () => {
            const details = item.querySelector('.todo-details');
            details?.classList.toggle('hidden');
        });

        // Delete
        item.querySelector('.btn-delete')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                App.deleteTodo(todoId);
                renderTodos();
                renderProjects(); // Update counts
            }
        });

        // Edit
        item.querySelector('.btn-edit')?.addEventListener('click', () => {
            showEditTodoModal(todoId);
        });
    });
};

// const sortSelectListener = () => {
//     const sortSelect = document.querySelector('.sort-select');
//     if (sortSelect) {
//         sortSelect.addEventListener('change', (e) => {
//             App.setCurrentSort(e.target.value);
//             renderTodos();
//         });
//     }
// };

// === INICIALIZÁCIA ===
export const initDOM = () => {
    // Add todo form
    document.querySelector('.form-add-todo')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        App.addTodo(
            formData.get('title'),
            formData.get('description'),
            formData.get('dueDate'),
            formData.get('priority'),
            formData.get('notes'),
        );
        hideAddTodoModal();
        renderTodos();
        renderProjects();
    });

    // Add project form
    document.querySelector('.form-add-project')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        App.addProject(formData.get('name'));
        hideAddProjectModal();
        renderProjects();
    });

    // Edit todo form
    document.querySelector('.form-edit-todo')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const todoId = formData.get('todoId');

        App.editTodo(todoId, {
            title: formData.get('title'),
            description: formData.get('description'),
            dueDate: formData.get('dueDate'),
            priority: formData.get('priority'),
            notes: formData.get('notes'),
        });

        hideEditTodoModal();
        renderTodos();
    });

    // Buttons
    document.querySelector('.btn-add-todo')?.addEventListener('click', showAddTodoModal);
    document.querySelector('.btn-add-project')?.addEventListener('click', showAddProjectModal);

    // Close modals
    document.querySelectorAll('.modal-close').forEach((btn) => {
        btn.addEventListener('click', () => {
            hideAddTodoModal();
            hideAddProjectModal();
            hideEditTodoModal();
        });
    });
    // sortSelectListener();
    // Initial render
    renderProjects();
    renderTodos();
};
