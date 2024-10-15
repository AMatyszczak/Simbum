import { Add, Edit, Done, AddPhotoAlternate, ArrowBack, Delete} from "@mui/icons-material";
import SettingsIcon from '@mui/icons-material/Settings';
import { Grid, ButtonBase, Paper, Box, Typography, styled, AppBar, IconButton, Toolbar, Modal, Stack, TextField, Fab, Card, Button, ImageList, ImageListItem, ImageListItemBar, Dialog, DialogActions, DialogContent, DialogTitle, CssBaseline } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import { render } from "react-dom";
import { HistoryRouterProps, useLocation, useNavigate } from "react-router-dom";
import { StyledModal, StyledFab, ImgWithPointer } from "./FamilyGalleryComponent";


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
    const [imageHash, setImageHash] = useState(Date.now())

    const [galleryData, setGalleryData] = useState([])

    const [modalOfTypeCreate, setModalOfTypeCreate] = useState<boolean>(true)
    const [createEditTurnModalOpen, setCreateEditTurnModalOpen] = useState(false)
    const [createEditTurnId, setCreateEditTurnId] = useState("")
    const [createEditTurnName, setCreateEditTurnName] = useState("")
    const [createEditTurnAvatarPath, setCreateEditTurnAvatarPath] = useState("")

    const handleCreateEditTurnTitleChange = (e: any) => setCreateEditTurnName(e.target.value)

    const handleCreateTurnModalOpen = () => {
        setModalOfTypeCreate(true)
        setCreateEditTurnId("")
        setCreateEditTurnName("")
        setCreateEditTurnAvatarPath("")

        setCreateEditTurnModalOpen(true)
    }
    const handleEditTurnModalOpen = (turnId: string, turnName: string, turnAvatarPath: string) => { 
        setModalOfTypeCreate(false)
        setCreateEditTurnId(turnId)
        setCreateEditTurnName(turnName)
        setCreateEditTurnAvatarPath(turnAvatarPath)

        setCreateEditTurnModalOpen(true)
    }
    const handleCloseCreateEditTurnModal = () => setCreateEditTurnModalOpen(false)
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
            loadTurnGalleryData(location.state.family.id)
            handleCloseCreateEditTurnModal()
            setCreateEditTurnAvatarPath("")
            setCreateEditTurnName("")
        })
    
        window.electron.ipcRenderer.sendMessage('add-turn', [location.state.family.id, createEditTurnName, createEditTurnAvatarPath])
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

    function modifyTurn(e: any) {
        const turnId: string = createEditTurnId
        const turnName: string = createEditTurnName
        const turnAvatarPath: string = createEditTurnAvatarPath

        window.electron.ipcRenderer.once('modify-turn', (arg: any) => {
            console.log("modify-turn successful")
            loadTurnGalleryData(location.state.family.id)
        })
        
        console.log("modifyTurn, e:",e, "turnId:", turnId, "turnName:", turnName, "turnAvatarPath:", turnAvatarPath)
        setCreateEditTurnModalOpen(false)
        if(turnId != null && turnId.length > 0) {
            window.electron.ipcRenderer.sendMessage('modify-turn', [location.state.family.id, turnId, turnName, turnAvatarPath])
        }
        setCreateEditTurnId("")
        setCreateEditTurnName("")
        setCreateEditTurnAvatarPath("")
    }

    function loadTurnGalleryData(familyId: string){
        window.electron.ipcRenderer.once('get-turn-gallery-data', (arg:any) => {
            console.log('getTurnGalleryData, data:', arg)
            setImageHash(Date.now())

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
            setCreateEditTurnAvatarPath(`${file.path}`);
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
            <CssBaseline />

            <Modal
                open={createEditTurnModalOpen}
                onClose={handleCloseCreateEditTurnModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={StyledModal}>
                    <Stack direction="column">
                        <AppBar position='static'>
                            <Typography id="modal-modal-title" variant="h4" align="center" sx={{background: "primary"}}>
                                {modalOfTypeCreate ? "Dodaj nową turę" : `Edytuj`}
                            </Typography>
                        </AppBar>
                        <TextField value={createEditTurnName} 
                            onChange={handleCreateEditTurnTitleChange} 
                            id="outlined-basic"
                            label="Nazwa"
                            variant="filled" 
                            color="secondary"/>
                        <Box display='flex'
                            alignItems='center'
                            justifyContent="center"
                            sx={{minHeight: 320}}
                            onDragOver={onNewTurnImageDragOver}
                            onDrop={(e) => onNewTurnImageDrop(e)}> 
                                {
                                    (createEditTurnAvatarPath != null && createEditTurnAvatarPath.length > 0) ?
                                        <img src={"file://"+ createEditTurnAvatarPath} style={{'objectFit': 'contain',"width": "100%"}}></img>                                
                                        : <AddPhotoAlternate style={{ fontSize: 40, color: 'white'}} onDrop={(e) => onNewTurnImageDrop(e)}/>
                                    
                                }
                        </Box>
                        <StyledFab color='primary' onClick={(e) => {modalOfTypeCreate ? addNewTurn(e) : modifyTurn(e)}} >
                            {modalOfTypeCreate ? <Add /> : <Done/>}
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
                        aria-label="add turn"
                        sx={{ mr: 2 }}
                        onClick={handleCreateTurnModalOpen}
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
                            src={`file://${turn["imagePath"]}?${imageHash})`}
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
                                        onClick={(e: any) => handleEditTurnModalOpen(turn['turnId'], turn['turnName'], turn['imagePath'])}
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
        </Box>
    )
}