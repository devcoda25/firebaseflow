export const NODE_COLORS = [
    'hsl(262 83% 58%)', // purple
    'hsl(16 84% 62%)',  // orange
];

export function getRandomColor(): string {
    return NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
}
