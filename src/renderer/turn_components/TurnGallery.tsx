import { Add, AddPhotoAlternate, ArrowBack, Delete, Edit} from "@mui/icons-material";
import SettingsIcon from '@mui/icons-material/Settings';
import { Grid, ButtonBase, Paper, Box, Typography, styled, AppBar, IconButton, Toolbar, Modal, Stack, TextField, Fab, Card, Button, ImageList, ImageListItem, ImageListItemBar, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import { render } from "react-dom";
import { HistoryRouterProps, useLocation, useNavigate } from "react-router-dom";


const ImgWithPointer = styled('img')({
    "&:hover": {
      cursor: "pointer",
      opacity: 0.8,
    },
})

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

type LocationState = {
    state: {
        family: {
            id: string;
            name: string;
        }
    }
}

export default function TurnGallery() {

    const location = useLocation() as LocationState
    const navigate = useNavigate()

    const [galleryData, setGalleryData] = useState([])

    const [newTurnModalOpen, setNewTurnModalOpen] = useState(false)
    const [newTurnName, setNewTurnName] = useState("")
    const [newTurnImagePath, setNewTurnAvatarPath] = useState("")

    const handleNewTurnTitleChange = (e: any) => setNewTurnName(e.target.value)

    const handleOpenNewTurnModal = () => setNewTurnModalOpen(true)
    const handleCloseNewTurnModal = () => setNewTurnModalOpen(false)
    const handleReturnToPreviousPage = () => navigate(-1)

    const [deleteTurnDialogOpen, setDeleteTurnDialogOpen] = React.useState<boolean>(false);
    const [deleteTurnId, setDeleteTurnId] = React.useState<string>("")
    const [deleteTurnName, setDeleteTurnName] = React.useState<string>("")
    const [deleteTurnPrompt, setDeleteTurnPrompt] = React.useState<string>("")

    const handleDeleteTurnDialogOpen = (turnId: string, turnName: string) => {
        console.log("turnId:", turnId, "turnName:", turnName)
        setDeleteTurnId(turnId)
        setDeleteTurnName(turnName)
        
        setDeleteTurnDialogOpen(true);
    };

    const handleDeleteTurnDialogClose = () => {
        setDeleteTurnId("")
        setDeleteTurnName("")

        setDeleteTurnDialogOpen(false);
    };

    useEffect(() => {
        loadTurnGalleryData(location.state.family.id)
    }, [])


    function addNewTurn(e: any) {
        window.electron.ipcRenderer.once('add-turn', (arg: any) => {
            console.log("new turn added, arg:", arg)
            loadTurnGalleryData(location.state.family.id)
            handleCloseNewTurnModal()
            setNewTurnAvatarPath("")
            setNewTurnName("")
        })
    
        window.electron.ipcRenderer.sendMessage('add-turn', [location.state.family.id, newTurnName, newTurnImagePath])
    }

    function deleteTurn(e: any, turnId: string) {
        window.electron.ipcRenderer.once('delete-turn', (arg: any) => {
            console.log("delete-turn successful")
            loadTurnGalleryData(location.state.family.id)
        })
        
        console.log("deleteTurn, e:",e, "turnId:", turnId)
        setDeleteTurnDialogOpen(false)
        if(turnId != null && turnId.length > 0) {
            window.electron.ipcRenderer.sendMessage('delete-turn', [location.state.family.id, turnId])
        }
        setDeleteTurnName("")
        setDeleteTurnId("")
    }

    function loadTurnGalleryData(familyId: string){
        window.electron.ipcRenderer.once('get-turn-gallery-data', (arg:any) => {
            console.log('getTurnGalleryData, data:', arg)
            setGalleryData(arg)
        })

        console.log("loadTurn")
        window.electron.ipcRenderer.sendMessage('get-turn-gallery-data', [familyId])
    }


    function onNewTurnImageDragOver(e: any) {
        event?.stopPropagation();
        event?.preventDefault();
    }


    function onNewTurnImageDrop(e: any) {
        console.log("onNewFamilyImageDrop")

        e.preventDefault()
        
        const file = e.dataTransfer.files.item(0);

        if (file.type.includes('image/')) {
            setNewTurnAvatarPath(`${file.path}`);
        }
        e.stopPropagation()
    }

    function onTurnClick(e: any, turnGalleryData: any) {
        // console.log("turnGalleryData", turnGalleryData)
        const allTurnsIds = galleryData.map((data: any) => data.turnId)
        console.log("allTurnsIds", allTurnsIds, "location:", location, "turn:", turnGalleryData)
        navigate("/turn", {state:{allTurnsIds: allTurnsIds, turn: turnGalleryData, family:{id: location.state.family.id, name: location.state.family.name}}} ) 
    }

    function navigateToSettings() {
        navigate("/settings")
    }

    return(
        <Box sx={{ flexGrow: 1 }}>
            <Modal
                open={newTurnModalOpen}
                onClose={handleCloseNewTurnModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={StyledModal}>
                    <Stack direction="column">
                        <AppBar position='static'>
                            <Typography id="modal-modal-title" variant="h4" align="center" sx={{background: "primary"}}>
                                Dodaj nową turę
                            </Typography>
                        </AppBar>
                        <TextField value={newTurnName} onChange={handleNewTurnTitleChange} id="outlined-basic" label="Nazwa" variant="filled" />
                        <Box display='flex' alignItems='center' justifyContent="center" sx={{width: 400, height: 200, backgroundColor: 'grey'}} onDragOver={onNewTurnImageDragOver} onDrop={(e) => onNewTurnImageDrop(e)}> 
                                {
                                    (newTurnImagePath != null && newTurnImagePath.length > 0) ?
                                        <img src={"file://"+ newTurnImagePath} style={{"maxHeight": "200px"}}></img>                                
                                        : <AddPhotoAlternate style={{ fontSize: 40, color: 'white'}} onDrop={(e) => onNewTurnImageDrop(e)}/>
                                    
                                }
                        </Box>
                        <StyledFab color='primary' onClick={addNewTurn} >
                            <Add />
                        </StyledFab>
                    </Stack>
                </Box>
            </Modal>

            <Dialog
                open={deleteTurnDialogOpen}
                onClose={handleDeleteTurnDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Uwaga! Czy na pewno chcesz usunąć {deleteTurnName}? .
                </DialogTitle>
                <DialogContent>
                    <TextField autoFocus id="standard-basic" label="Aby usunać wpisz 'Potwierdzam'" variant="standard" sx={{width: 1}} onChange={(e:any) => setDeleteTurnPrompt(e.target.value)}/>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleDeleteTurnDialogClose}>Nie</Button>
                <Button onClick={(e:any) => deleteTurn(e, deleteTurnId)} autoFocus disabled={deleteTurnPrompt !== "Potwierdzam"}>
                   Tak 
                </Button>
                </DialogActions>
            </Dialog>

            <AppBar position="static" color='primary'>
                <Toolbar variant='dense'>
                
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="go back"
                        sx={{ mr: 2 }}
                        onClick={handleReturnToPreviousPage}
                    >
                        <ArrowBack />
                    </IconButton>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="add family"
                        sx={{ mr: 2 }}
                        onClick={handleOpenNewTurnModal}
                    >
                        <Add />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1}}
                    >
                        Tury {location.state.family.name}
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
                {galleryData.map((turn: any) => (
                    <ImageListItem key={turn["imagePath"]}>
                        <ImgWithPointer
                            srcSet={`file://${turn["imagePath"]}`}
                            src={`file://${turn["imagePath"]}`}
                            style={{ width: '100%'}}
                            alt={turn['name']}
                            loading="lazy"
                            onClick={(e:any) => onTurnClick(e, turn)}
                        />
                        <ImageListItemBar
                            title={turn['turnName']}
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
                                        onClick={(e: any) => handleDeleteTurnDialogOpen(turn['turnId'], turn['turnName'])}
                                        >
                                        <Delete />
                                    </IconButton>
                                </>
                            }
                        />
                    </ImageListItem>
                ))}
            </ImageList>

            {/* <Grid container >
                {
                galleryData.map((turn: any) => (
                    <Card sx={{margin: 2, maxWidth: 500, flexGrowi: 1}}
                            onClick={(e) => onTurnClick(e, turn)}
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
                                        <Img alt="complex" src={"file://" + turn["imagePath"]} />
                                    </Box>

                                </Grid>
                                <Grid item xs={12} sm container>
                                    <Grid item xs container direction="column" spacing={2}>
                                        <Grid item xs>
                                            <Typography gutterBottom variant="subtitle1" component="div">
                                                {turn['turnName']}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                            </Grid> 
                            </Grid>
                        </Paper>
                    </Card>
                ))}
            </Grid> */}
        </Box>
    )
}