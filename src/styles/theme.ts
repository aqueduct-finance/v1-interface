import { darkTheme } from 'aqueduct-widget';
import { Theme } from 'aqueduct-widget/dist/theme';

const theme: Theme = {
    ...darkTheme,
    bgColor: '#00000050',
    streamLengthBox: '#ffffff14',
    tokenBox: '#ffffff14',
    useMaxButton: '#ffffff20',
    textFont: "'Neue Haas Grotesk Display Pro Roman', sans-serif",
    numberFont: "'Neue Haas Grotesk Display Pro', sans-serif",
    primaryFontWeight: '500',
    titleFontWeight: '500',
    accentFontWeight: '500',
    borderColor: '#ffffff18',
    swapButtonRadius: '1.5rem',
    timeSelectBottomBorderRadius: '1.5rem',
    useMaxText: '#FFFFFF',
    accentBorderWidth: '1px',
    accentBorderColor: '#FFFFFF10'
}

export default theme;