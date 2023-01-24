const GenerateColor = (arrayIndex) => {
    // Using golden angle approximation
    const hue = 239 + arrayIndex * 137.508;
    return `hsl(${hue}, 63%, 55%)`;
};

export default GenerateColor;
