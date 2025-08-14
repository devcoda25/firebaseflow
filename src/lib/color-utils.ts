export const NODE_COLORS = [
    'hsl(262 83% 58%)', // purple
    'hsl(16 84% 62%)',  // orange
    'hsl(221 83% 53%)', // blue
    'hsl(346.8 77.2% 49.8%)', // pink
    'hsl(142.1 76.2% 36.3%)', // green
    'hsl(215.1 100% 60.2%)', // sky
];

export function getRandomColor(): string {
    return NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
}
