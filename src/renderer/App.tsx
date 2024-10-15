import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'react-quill/dist/quill.snow.css';
import SettingsComponent from './settings/SettingsComponent';
import React from 'react';
import TurnComponent from './turn_components/TurnComponent';
import LoadingComponent from './loading_component/LoadingComponent';
import FamilyGalleryComponent from './turn_components/FamilyGalleryComponent';
import TurnGallery from './turn_components/TurnGallery';
import { ThemeProvider, createTheme } from '@mui/material';
// import f from './../../assets/fonts/LoucosLyne_thesimssansbold.otf';
// import font from '../../assets/fonts'
import LoucosLyne_thesimssansbold from '../../assets/fonts/Loucos Lyne - thesimssansboldsc.woff2'
import deepPurple from '@mui/material/colors/deepPurple';
import { lightBlue } from '@mui/material/colors';

// e3eaf9
export const blueColor: string = "#0949ab"
export const theme = createTheme({
  palette: {
    primary: {
      light: '#C0CFE3',
      main: '#b1c4dd',
      dark: '#7B899A',
      contrastText: blueColor,
    },
    secondary: {
      light: 'rgba(103, 183, 247)',
      main: "#42a5f5",
      dark: '#2E73AB',
      contrastText: lightBlue[500],
    },
    text: {
      primary: blueColor,
      secondary: "rgba(19,106,224,0.6)",
    },
    background: {
      default: '#e3eafc',
      paper: '#e3eafc'
    },
  },
  typography: {
    fontFamily: [
      'LoucosLyne_thesimssansbold'
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'LoucosLyne_thesimssansbold';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;

          src: local('LoucosLyne_thesimssansbold'), local('LoucosLyne_thesimssansbold-Regular'), url(${LoucosLyne_thesimssansbold}) format('woff2');
        }
      `,
    },
  },
});

interface SimbumState {
  isComponentMounted: boolean;
  isDataPath: boolean;
}
class Simbum extends React.Component<any, SimbumState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isComponentMounted: false,
      isDataPath: false,
    };
  }

  componentDidMount(): void {
    const isDataPath = window.electron.store.get('dataPath') != null;
    console.log("isComponentMounted:", this.state.isComponentMounted, "isDataPath:", this.state.isDataPath, "dataPath:", window.electron.store.get('dataPath'))
    this.setState({ isComponentMounted: true, isDataPath: isDataPath });
  }

  render() {
  
    console.log("App.tsx render()")
  
    console.log("App.tsx:", this.state)
    if (!this.state.isDataPath) {
      console.log("App.tsx, render returns SettingsComponent")
      return <SettingsComponent isPathToUserFilesSet={this.state.isDataPath}/>;
    }
    if (!this.state.isComponentMounted) {
      console.log("App.tsx, render returns LoadingComponent")
      return <LoadingComponent />;
    }
   
    console.log("App.tsx, render returns FamilyGalleryComponent")
    return <FamilyGalleryComponent />
  }
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Simbum />} />
          <Route path="/familyGallery" element={<FamilyGalleryComponent />} />
          <Route path="/turn" element={<TurnComponent />} />
          <Route path="/turnGallery" element={<TurnGallery />} />
          <Route path="/settings" element={<SettingsComponent isPathToUserFilesSet={false}/>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
