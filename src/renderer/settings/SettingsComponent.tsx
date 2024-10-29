import { styled } from '@mui/material/styles';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppBar, Box, Button, CssBaseline, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

interface SettingsComponentState {
  pathToUserFiles: string;
  newPathSet: boolean;
}

interface SettingsComponentProps {
  isPathToUserFilesSet: boolean;
}


export default function SettingsComponent(props: SettingsComponentProps) {
  
  const navigate = useNavigate()
  const [pathToUserFiles, setPathToUserFiles] = useState("")
  const [newPathSet, setNewPath] = useState(false)

  useEffect(() => {
      setPathToUserFiles(window.electron.store.get('dataPath'))
  }, [])
  
  function selectPath() {
    window.electron.ipcRenderer.once('settings-select-path', (arg: any) => {
      console.log("selectPath once event:", arg)
      setPathToUserFiles(arg)
      setNewPath(true)
    });
    window.electron.ipcRenderer.sendMessage('settings-select-path', []);
  }

  function isPathToDataSet() {
    console.log("props:", props, "props.isPathToUserFilesSet", props.isPathToUserFilesSet, "pathToUserFiles:", pathToUserFiles)
    return props.isPathToUserFilesSet || pathToUserFiles
  }

  const handleReturnToPreviousPage = () => navigate(-1)

  if(newPathSet) { return <Navigate to="/familyGallery"/> }
  else return(
          <Box sx={{flexGrow: 1}}>

                <AppBar position="static" color='primary'>
                    <Toolbar variant='dense'>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1}}
                        align="center"
                    >
                    Ustawienia   
                    </Typography>

                      <IconButton
                          size="large"
                          edge="start"
                          color="inherit"
                          aria-label="go back"
                          onClick={handleReturnToPreviousPage}
                      >
                          <ArrowBack />
                      </IconButton>
                    </Toolbar>
                </AppBar>
            <CssBaseline />
            <Box sx={{ border: 1, margin: '2em'}}>
              <Box className="settings-content">
                <Stack direction={'row'} sx={{justifyContent: 'left', alignItems:'center'}} gap={'1em'}>
                  <Typography>Miejsce danych SimBum</Typography>
                  <Button
                    sx={{display: 'flex' }}
                    onClick={selectPath}
                    variant='contained'
                    >
                    {pathToUserFiles ? <span>Zmień folder SimBum</span> : "Wybierz folder SimBum"}
                  </Button>
                  <Typography> {pathToUserFiles ? 'Obecnie:' : ''} </Typography><Typography color='secondary'> { pathToUserFiles ? pathToUserFiles : ''}</Typography>
                </Stack>
              </Box>  
            </Box>
          </Box>
          );
        }