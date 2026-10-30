export const maxChoices = 10;

export const handleChange = (index, newValue, onChange, value) => {
    const updated = [...value];
    updated[index] = newValue; 
    onChange(updated);
};

export const addChoice = (onChange, value) => {
    if (value.length < maxChoices) {
        onChange([...value, ""]);
    }
};

export const deleteChoice = (index, onChange, value) => {
    if (value.length > 3) {
        const updated = value.filter((_, i) => i !== index);
        onChange(updated);
    }
};

export const removeAll = (onChange, value) => {
    if (value.length > 3) {
        onChange(value.slice(0, 3));
    }
};