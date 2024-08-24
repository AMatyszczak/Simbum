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
import { ipcRenderer } from 'electron';

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

export default function FamilyGalleryComponent() {
    const navigate = useNavigate();
    const [galleryData, setFamilyData] = useState([])
    
    const [newFamilyOpen, setNewFamilyModalOpen] = useState(false)
    const [newFamilyName, setNewFamilyName] = useState("")
    const [newFamilyImagePath, setNewFamilyAvatarPath] = useState("")


    const handleNewFamilyNameChange = (e: any) => setNewFamilyName(e.target.value)

    const handleOpenNewFamilyModal = () => setNewFamilyModalOpen(true)
    const handleCloseNewFamilyModal = () => setNewFamilyModalOpen(false)

    useEffect(() => {
        loadFamillyGalleryData()
    }, [])
    
    function loadFamillyGalleryData() {
        
        console.log("loadFamillyGalleryData")
        window.electron.ipcRenderer.once('get-family-gallery-data', (arg: any) => {
            console.log("got families:", arg)
            setFamilyData(arg);
        })

        window.electron.ipcRenderer.sendMessage('get-family-gallery-data', []);
    }

    function onFamilyClick(e:any, familyGalleryData: any){
        console.log("onAlbumClick", e, familyGalleryData)
        navigate("/albumGallery", {state:{family: familyGalleryData}} )    
        console.log("after navigate")    
    }

    function onAlbumRemoveClick(e: any, albumData: any) {
        console.log("onFamilyRemoveClick", e, albumData)
        e.stopPropagation(); 
    }


    function onNewFamilyImageOver(e: any) {
        event?.stopPropagation();
        event?.preventDefault();
    }


    function onNewFamilyImageDrop(e: any) {
        console.log("onNewFamilyImageDrop")

        e.preventDefault()
        
        const file = e.dataTransfer.files.item(0);

        if (file.type.includes('image/')) {
            setNewFamilyAvatarPath(`${file.path}`);

            // if(pageId != null) {
            //     window.electron.ipcRenderer.sendMessage('page-image-changed', [
            //     album.id,
            //     pageId,
            //     file.path,
            //     ]);
            // }
            
            // loadAlbumImages(familyId, album.id, false);
        }
        e.stopPropagation()
    }
    
    function onNewFamilyImageEnd(e: any) {
        console.log("onNewFamilyImageEnd")
    }
    
    function addNewFamily(e: any) {
        window.electron.ipcRenderer.once('add-family', (arg: any) => {
            console.log("new family added, arg:", arg)
            loadFamillyGalleryData()
            handleCloseNewFamilyModal()
            setNewFamilyAvatarPath("")
            setNewFamilyName("")
        })
    
        window.electron.ipcRenderer.sendMessage('add-family', [newFamilyImagePath, newFamilyName, 0])
    }


    return (
        <>
        <Modal
            open={newFamilyOpen}
            onClose={handleCloseNewFamilyModal}
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
                    <TextField value={newFamilyName} onChange={handleNewFamilyNameChange} id="outlined-basic" label="Nazwa" variant="filled" />
                    <Box display='flex' alignItems='center' justifyContent="center" sx={{width: 400, height: 200, backgroundColor: 'grey'}} onDragOver={onNewFamilyImageOver} onDragEnd={onNewFamilyImageEnd} onDrop={(e) => onNewFamilyImageDrop(e)}> 
                            {
                                (newFamilyImagePath != null && newFamilyImagePath.length > 0) ?
                                    <img src={"file://"+ newFamilyImagePath} style={{"maxHeight": "200px"}}></img>                                
                                    : <AddPhotoAlternate style={{ fontSize: 40, color: 'white'}} onDrop={(e) => onNewFamilyImageDrop(e)}/>
                                
                            }
                    </Box>
                    <StyledFab color='primary' onClick={addNewFamily} >
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
                    aria-label="add family"
                    sx={{ mr: 2 }}
                    onClick={handleOpenNewFamilyModal}
                >
                    <Add />
                </IconButton>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{ display: { xs: 'none', sm: 'block' } }}
                    align="center"
                >
                 Rodziny   
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                </Toolbar>
            </AppBar>
            </Box>


            <Grid container >
                {
                galleryData.map((data: any, i: number) => (
                    <Card sx={{margin: 2, minWidth: 400, maxWidth: 400, flexGrow: 1}}
                            onClick={(e) => onFamilyClick(e, data)}
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
                                        <Img alt="complex" src={"file://" + data["imagePath"]} /> 
                                        <Typography
                                            variant="h6"
                                            // noWrap
                                            component="div"
                                            sx={{ display: { xs: 'none', sm: 'block' } }}
                                            align="center"
                                        >
                                            {data['name']}
                                        </Typography>
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