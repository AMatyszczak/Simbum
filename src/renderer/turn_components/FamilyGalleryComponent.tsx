import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useEffect, useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppBar, Avatar, Badge, Box, Button, Card, CardActionArea, CardContent, CardHeader, CardMedia, CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fab, IconButton, ImageList, ImageListItem, ImageListItemBar, Modal, Stack, TextField, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { AccountCircle, Add, AddPhotoAlternate, Delete, Edit } from '@mui/icons-material';
import { ipcRenderer } from 'electron';
import React from 'react';


const StyledModal = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  height: 500,
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
  top: 470,
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


const ImgWithPointer = styled('img')({
    "&:hover": {
      cursor: "pointer",
      opacity: 0.8,
    },
})



const ImageListItemWithStyle = styled(ImageListItem)(({ theme }) => ({
    "&:hover": {
      cursor: "pointer",
      opacity: 0.8,
      //boxShadow: `5px 10px ${theme.palette.primary.main}`,
    },
  }));

export default function FamilyGalleryComponent() {
    const navigate = useNavigate();
    const [galleryData, setFamilyData] = useState([])
    
    const [newFamilyOpen, setNewFamilyModalOpen] = useState(false)
    const [newFamilyName, setNewFamilyName] = useState("")
    const [newFamilyImagePath, setNewFamilyAvatarPath] = useState("")

    const handleNewFamilyNameChange = (e: any) => setNewFamilyName(e.target.value)

    const handleOpenNewFamilyModal = () => setNewFamilyModalOpen(true)
    const handleCloseNewFamilyModal = () => setNewFamilyModalOpen(false)

    const [deleteFamilyDialogOpen, setDeleteFamilyDialogOpen] = React.useState<boolean>(false);
    const [deleteFamilyId, setDeleteFamilyId] = React.useState<string>("")
    const [deleteFamilyName, setDeleteFamilyName] = React.useState<string>("")
    const [deleteFamilyPrompt, setDeleteFamilyPrompt] = React.useState<string>("")

    const handleDeleteFamilyDialogOpen = (familyId:string, familyName: string) => {
        setDeleteFamilyId(familyId)
        setDeleteFamilyName(familyName)
        
        setDeleteFamilyDialogOpen(true);
    };

    const handleDeleteFamilyDialogClose = () => {
        setDeleteFamilyId("")
        setDeleteFamilyName("")

        setDeleteFamilyDialogOpen(false);
    };


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
        navigate("/turnGallery", {state:{family: familyGalleryData}} )    
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
            setNewFamilyAvatarPath(file.path);
        }
        e.stopPropagation()
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

    function deleteFamily(e: any, familyId: string) {
        window.electron.ipcRenderer.once('delete-family', (arg: any) => {
            console.log("delete-family successful")
            loadFamillyGalleryData()
        })
        
        console.log("deleteFamily, e:",e, "familyId:", familyId)
        setDeleteFamilyDialogOpen(false)
        if(familyId != null && familyId.length > 0) {
            window.electron.ipcRenderer.sendMessage('delete-family', [familyId])
        }
        setDeleteFamilyName("")
        setDeleteFamilyId("")
    }

    function navigateToSettings() {
        navigate("/settings")
    }

    return (
        <Box sx={{display: {flex: 1}}}>
            <CssBaseline />

            <Dialog
                open={deleteFamilyDialogOpen}
                onClose={handleDeleteFamilyDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Uwaga! Czy na pewno chcesz usunąć {deleteFamilyName}? .
                </DialogTitle>
                <DialogContent>
                    <TextField autoFocus id="standard-basic" label="Aby usunać wpisz 'Potwierdzam'" variant="standard" sx={{width: 1}} onChange={(e:any) => setDeleteFamilyPrompt(e.target.value)}/>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleDeleteFamilyDialogClose}>Nie</Button>
                <Button onClick={(e:any) => deleteFamily(e, deleteFamilyId)} autoFocus disabled={deleteFamilyPrompt !== "Potwierdzam"}>
                   Tak 
                </Button>
                </DialogActions>
            </Dialog>
        
            <Modal
                open={newFamilyOpen}
                onClose={handleCloseNewFamilyModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={StyledModal} >
                    <Stack direction="column">
                        <AppBar position='static'>
                            <Typography id="modal-modal-title" variant="h4" align="center" sx={{background: "primary"}}>
                                Dodaj nową rodzinę
                            </Typography>
                        </AppBar>
                        <TextField value={newFamilyName}
                            onChange={handleNewFamilyNameChange}
                            id="outlined-basic"
                            label="Nazwa"
                            variant="filled" 
                            />
                        <Box display='flex' 
                            alignItems='center'
                            justifyContent='center'
                            sx={{ minHeight: '320px', backgroundColor: newFamilyImagePath !== null && newFamilyImagePath.length > 0 ? 'white' : 'grey'}}
                            onDragOver={onNewFamilyImageOver} 
                            onDrop={(e) => onNewFamilyImageDrop(e)}> 
                                {
                                    (newFamilyImagePath != null && newFamilyImagePath.length > 0) ?
                                        <img src={"file://"+ newFamilyImagePath} style={{'objectFit': 'contain',"width": "100%"}}></img>                                
                                        : <AddPhotoAlternate style={{ fontSize: 40, color: 'white', alignSelf: 'center', justifySelf: 'center'}} onDrop={(e) => onNewFamilyImageDrop(e)}/>
                                    
                                }
                        </Box>
                        <StyledFab color='primary' onClick={addNewFamily} >
                            <Add />
                        </StyledFab>
                    </Stack>
                </Box>
            </Modal>
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
                        sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1}}
                        align="center"
                    >
                    Rodziny   
                    </Typography>
                        <IconButton
                            size="large"
                            color="inherit"
                            aria-label="Settings"
                            onClick={navigateToSettings}
                        >
                            <SettingsIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>

            <ImageList sx={{ width: '100vw', maxHeight: 'calc(100vh - 42px)', margin: 0, padding: 1}} cols={6} >
                {galleryData.map((data: any) => (
                    <ImageListItem key={data["imagePath"]}>
                        <ImgWithPointer
                            srcSet={`file://${data["imagePath"]}`}
                            src={`file://${data["imagePath"]}`}
                            style={{ width: '100%'}}
                            alt={data['name']}
                            loading="lazy"
                            onClick={(e:any) => onFamilyClick(e, data)}
                        />
                        <ImageListItemBar
                            title={data['name']}
                            subtitle={<span>Mieszka w : {data['name']}</span>}
                            sx={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%, rgba(0,0,0,0) 100%)', paddingRight: 1 }}
                            actionIcon={
                                <>
                                    <IconButton
                                        size="large"
                                        edge="start"
                                        color="inherit"
                                        aria-label="go back"
                                        sx={{padding: 0, color: 'white'}}
                                        >
                                        <Edit />
                                    </IconButton>
                                    
                                    <IconButton
                                        size="large"
                                        color="inherit"
                                        aria-label="Delete"
                                        sx={{padding: 0, color: 'white'}}
                                        onClick={(e: any) => handleDeleteFamilyDialogOpen(data['id'], data['name'])}
                                        >
                                        <Delete />
                                    </IconButton>
                                </>
                            }
                        />
                    </ImageListItem>
                ))}
            </ImageList>
        </Box>
    );
}