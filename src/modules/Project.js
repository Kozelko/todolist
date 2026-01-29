// Factory function pre vytvorenie projektu
export const createProject = (name, isDefault = false) => {
    return {
        id: isDefault ? 'default' : Date.now().toString(),
        name,
        isDefault,
        createdAt: new Date().toISOString(),
    };
};

// Pomocné funkcie pre prácu s projektmi
export const renameProject = (project, newName) => {
    return { ...project, name: newName };
};
