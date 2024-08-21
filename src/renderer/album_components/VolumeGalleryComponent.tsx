import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useEffect, useState } from 'react';
import { AppBar, Badge, Box, Card, Divider, Fab, IconButton, Modal, Stack, TextField, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { AccountCircle, Add, AddPhotoAlternate } from '@mui/icons-material';

const StyledModal = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  height: 300,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  pr: 4,
  pl: 4,
  pb: 4
};

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: 325,
  left: 0,
  right: 0,
  margin: '0 auto',
});

const Img = styled('img')({
  margin: 'auto',
  display: 'block',
  maxWidth: '100%',
  maxHeight: '100%',
});

export default function VolumeGalleryComponent() {
    const navigate = useNavigate();
    const [galleryData, setGalleryData] = useState([])
    const [newVolumeOpen, setNewVolumeOpen] = useState(false)
    const handleOpenNewVolume = () => setNewVolumeOpen(true)
    const handleCloseNewVolume = () => setNewVolumeOpen(false)

    useEffect(() => {
        console.log("VolumeGallerycomponent")
        window.electron.ipcRenderer.once('get-volume-gallery-data', (arg: any) => {
            console.log("got volumes:", arg)
            setGalleryData(arg);
        })

        window.electron.ipcRenderer.sendMessage('get-volume-gallery-data', []);
    }, [])

    function onVolumeClick(e:any, volumeGalleryData: any){
        console.log("onAlbumClick", e, volumeGalleryData)
        navigate("/albumGallery", {state:{volume: volumeGalleryData}} )    
        console.log("after navigate")    
    }

    function onAlbumRemoveClick(e: any, albumData: any) {
        console.log("onVolumeRemoveClick", e, albumData)
        e.stopPropagation(); 
    }

    return (
        <>
        
        {/* <Button onClick={() => setNewVolumeOpen(true)}>Open modal</Button> */}
        <Modal
            open={newVolumeOpen}
            onClose={handleCloseNewVolume}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={StyledModal}>
                <Stack direction="column">
                    <AppBar position='static'>
                        <Typography id="modal-modal-title" variant="h4" align="center" sx={{background: "primary"}}>
                            Dodaj nową rodzinę
                        </Typography>
                    </AppBar>
                    <TextField id="outlined-basic" label="Nazwa rodziny" variant="filled" />
                    <Box display='flex' alignItems='center' justifyContent="center" sx={{height: 200, backgroundColor: 'grey'}}>
                        <AddPhotoAlternate style={{ fontSize: 40, color: 'white'}}/>
                    </Box>
                    <StyledFab color='primary'>
                        <Add />
                    </StyledFab>
                </Stack>
            </Box>
        </Modal>
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" color='primary'>
                <Toolbar variant='dense'>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="add volume"
                    sx={{ mr: 2 }}
                    onClick={handleOpenNewVolume}
                >
                    <Add />
                </IconButton>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                    
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                </Toolbar>
            </AppBar>
            </Box>


            <Grid container >
                {
                galleryData.map((data: any, i: number) => (
                    <Card sx={{margin: 2, minWidth: 400, maxWidth: 400, flexGrow: 1}}
                            onClick={(e) => onVolumeClick(e, data)}
                            key={i}
                    >
                        <Paper
                            sx={{
                                cursor: 'pointer',
                                p: 2,
                                flexGrow: 1,
                                backgroundColor: (theme) =>
                                theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
                            }}
                            >
                            <Grid container spacing={1}>
                                <Grid item>
                                    <Box display="flex" sx={{ width: 128, height: 128 }} >
                                        <Img alt="complex" src={"file://" + data["imagePath"]} /> tom 1 rodzina noobw
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm container>
                                    <Grid item xs container direction="column" spacing={2}>
                                        <Grid item xs>
                                            <Typography gutterBottom variant="subtitle1" component="div">
                                                {data["albumTitle"]}
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                {data["albumDescription"]}
                                            </Typography>
                                        </Grid>
                                        <ButtonBase>
                                            <Grid item>
                                                <Typography  variant="body2" onMouseDown={(e) => onAlbumRemoveClick(e, data)}>
                                                    Remove
                                                </Typography>
                                            </Grid>
                                        </ButtonBase>
                                    </Grid>
                            </Grid> 
                            </Grid>
                        </Paper>
                    </Card>
                ))}
            </Grid>
        </>
    );
}