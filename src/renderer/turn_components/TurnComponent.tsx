import '../App.css';
import 'react-quill/dist/quill.snow.css';
import DescriptionEditor from './DescriptionEditor';
import button_right from '../../../assets/buttons/button_right.png';
import button_left from '../../../assets/buttons/button_left.png';
import placeholder from '../../../assets/img_placeholder.png';
import SettingsIcon from '@mui/icons-material/Settings';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowBack, Delete } from '@mui/icons-material';
import Grid from '@mui/material/Grid2';
import { AppBar, Toolbar, IconButton, Typography, Box, CssBaseline, ButtonBase, Stack } from '@mui/material';


type LocationState = {
  state: {
    family: {
      id: string;
      name: string;
    },
    allTurnsIds: string[],
    turn: {
      turnId: string;
      turnName: string;
      description: string;
      imagePath: string;
    };
  }
}

export default function TurnComponent() {
  
  
  const navigate = useNavigate();
  const location = useLocation() as LocationState;
  const familyId: string = location.state.family.id;
  const allturnsIds: string[] = location.state.allTurnsIds;
  
  const [turnId, setTurnId] = useState<string>(location.state.turn.turnId)
  const [turnIndex, setTurnIndex] = useState<number>(0)
  const [turnImages, setTurnEventsImages] = useState<{id: string, filename: string, path: string}[]>([])
  const [turnEventImageId, setTurnEventImageId] = useState<string>("")
  const [turnEventMainImagePath, setTurnEventMainImagePath] = useState('')
  const [turnEventMainImageDimensions, setTurnEventMainImageDimensions] = useState<{width: number, height: number}>({width: 100, height: 100})
  
  const [pagesLoaded, setPagesLoaded] = useState<boolean>(false)
  const [imageHash, setImageHash] = useState(Date.now())
  
  const [savedThumbnails, setSavedThumbnails] = useState<{path: string, filename: string, id: string}[]>([])
  const [showedThumbnails, setShowedThumbnails] = useState<{path: string, filename: string, id: string}[]>([])
  
  const [draggedElement, setDraggedElement] = useState<{path: string, filename: string, id: string}>({path: '', filename: '', id: ''})
  const [isDragging, setIsDrawing] = useState(false)
  const [indexOfDraggedElement, setIndexOfDraggedElement] = useState(-1)
  
  const handleReturnToPreviousPage = () => navigate(-1)
  
  const observedMainImage = useRef(null)
  
  useEffect(() => {
    if(!observedMainImage.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
        if(observedMainImage.current != null) {
          const height = observedMainImage.current.clientHeight
          if(height !== turnEventMainImageDimensions.height) {
            setTurnEventMainImageDimensions({width: 100, height: height});
          }
        }
      });
    resizeObserver.observe(observedMainImage.current)

    const turnIndex: number = allturnsIds.findIndex((id: string) => id == turnId)
    setTurnIndex(turnIndex)
    loadTurnById(familyId, turnId, 0)

    return function cleanup() {
      resizeObserver.disconnect();
    }
  }, [observedMainImage.current])
  
  
  function loadTurnById(familyId: string, turnId: string, indexOfImageToDisplay: number) {
    setTurnId(turnId)
    window.electron.ipcRenderer.once('get-turn', (arg: any) => {
      setPagesLoaded(true)
      loadTurnImages(familyId, turnId, indexOfImageToDisplay)
    });
    window.electron.ipcRenderer.sendMessage('get-turn', [familyId, turnId]);  
  }

  function isLastTurnDisplayed(): boolean {
    return turnIndex >= allturnsIds.length - 1
  }

  function isFirstTurnDisplayed(): boolean {
    return turnIndex <= 0
  }

  function onNextTurnClick() {
    if(!isLastTurnDisplayed()) {
      const nextIndex: number = turnIndex + 1
      setTurnIndex(nextIndex)
      loadTurnById(familyId, allturnsIds[nextIndex], 0);
    }
  }

  function onPrevTurnClick() {
    if(!isFirstTurnDisplayed()) {
      const nextIndex: number = turnIndex - 1
      setTurnIndex(nextIndex)
      loadTurnById(familyId, allturnsIds[nextIndex], 0);
    }
  }

  function deleteMainEventImage(): any {
    if(turnImages.length >= 1) {
      window.electron.ipcRenderer.sendMessage('page-image-deleted', [familyId, turnId, turnEventImageId]);
      
      loadTurnImages(familyId, turnId, 0) // what if I remove last image?
    }
  }
  
  function handleDropOnMainImage(e: any) {
    e.preventDefault()
    
    setIsDrawing(false)
    
    const file = e.dataTransfer.files.item(0);

    if (file.type.includes('image/')) {
      setTurnEventMainImagePath(`file://${file.path}`);

      if(turnImages.length == 0) {
        window.electron.ipcRenderer.sendMessage('add-turn-image', [
          familyId,
          turnId,
          0,
          file.path
        ])
      } else {
        if(turnEventImageId != null && turnEventImageId != "") {
          window.electron.ipcRenderer.sendMessage('update-turn-image', [
            familyId,
            turnId,
            turnEventImageId,
            file.path,
          ]);
        }
      }
      
      loadTurnById(familyId, turnId, 0)
    }
    e.stopPropagation()
  }

  function handleDropOnThumbnails(e: any) {
    e.preventDefault()
    console.log("dropOnThumbnails:", e.target.className)
    if(e.target.className == "thumbnails-stack") {
      setIsDrawing(false)
      setShowedThumbnails([...savedThumbnails]) 
    }

    setIsDrawing(false)
    const file = e.dataTransfer.files.item(0);
    if (file.type.includes('image/')) {
      window.electron.ipcRenderer.sendMessage('add-turn-image', [
        familyId,
        turnId,
        indexOfDraggedElement,
        file.path
      ])
      
      loadTurnById(familyId, turnId, indexOfDraggedElement)
    } 
    e.stopPropagation();
  }; 
  
  function handleDragOver(e: any) {
    e.preventDefault();
    if (isDragging) {
      let element: any = e.target.id == 'thumbnails-stack' ? e.target : e.target.parentElement
      
      const thumbnailImageHeight = element.children.item(0)?.clientHeight
      const postionOfImageOnThumbnails = determinePositionOfImage(element, e.clientY, thumbnailImageHeight, false)

      if (indexOfDraggedElement !== postionOfImageOnThumbnails) {
        const thumbs = [...savedThumbnails]
        thumbs.splice(postionOfImageOnThumbnails, 0, draggedElement)
        setShowedThumbnails(thumbs)
        setIndexOfDraggedElement(postionOfImageOnThumbnails)
      }
    }

    e.stopPropagation();
  };

  function handleLeave(e: any) {
    e.preventDefault();

    if(isDragging && e.relatedTarget.id != "thumbnails-stack" && e.relatedTarget.id != "single-thumbnail") {
      setIsDrawing(false)
      setShowedThumbnails([...savedThumbnails])
      setIndexOfDraggedElement(-1)
    }

    e.stopPropagation();
  };

  function handleDragEnter(e: any) {
    e.preventDefault();

    if (e.target.parentElement.id == "thumbnails-stack" && !isDragging) {
      const postionOfImageOnThumbnails = determinePositionOfImage(e.target.parentElement, e.clientY, e.target.parentElement.children.item(0).clientHeight, false)
      
      let thumbs: {path: string, filename: string, id: string}[] = [...savedThumbnails]
      let ele = {
        path: placeholder,
        filename: "",
        id: "69",
      }
      thumbs.splice(postionOfImageOnThumbnails, 0, ele);
      
      setShowedThumbnails(thumbs)
      setIsDrawing(true)
      setIndexOfDraggedElement(postionOfImageOnThumbnails)
      setDraggedElement(ele)

      e.stopPropagation();
    }
  }

  function determinePositionOfImage(element: HTMLElement, clientY: any, thumbnailImageHeight: number, addImageHeight: boolean) {
    const margin = 8;
    const imageHeight = thumbnailImageHeight + margin;
    const parentElementBoundRect = element.getBoundingClientRect()
    const scrollTop = element.scrollTop;
    let relativeY = clientY - parentElementBoundRect.top + scrollTop; 
    if (addImageHeight) {
      relativeY += imageHeight;
    }
    let postionOfImage = Math.floor(relativeY/imageHeight)
    if (postionOfImage < 0) {
      postionOfImage = 0
    }
    return postionOfImage
  }

  function loadTurnImages(familyId: string, turnId: string, indexOfImageToDisplay: number) {
    window.electron.ipcRenderer.once('get-turn-images', (arg: any) => {
      const thumbnails: {path: string, filename: string, id: string}[] = arg ? arg : []
      if(thumbnails.length >0) {
        setImageHash(Date.now())
        setTurnEventImageId(thumbnails[indexOfImageToDisplay].id)
        setTurnEventMainImagePath(thumbnails[indexOfImageToDisplay].path)
        setTurnEventsImages(thumbnails)
        setSavedThumbnails(thumbnails)
        setShowedThumbnails(thumbnails)
      } else {
          setTurnEventMainImagePath("")
          setTurnEventsImages([])
          setSavedThumbnails([])
          setShowedThumbnails([])
      }
    });
    window.electron.ipcRenderer.sendMessage('get-turn-images', [familyId, turnId]);
  }

  function displayTurnEventImage(pageId: string) {
    const pageNo: any = turnImages.findIndex((e: any) => e.id == pageId.toString())

    if(pageNo != -1) {
      setTurnEventImageId(turnImages[pageNo].id)
      setTurnEventMainImagePath(turnImages[pageNo].path)
    }
  }

  function navigateToSettings() {
    navigate("/settings")
  }

  function onMainImageLoaded(e: any) {
    setTurnEventMainImageDimensions({width: e.target.clientWidth, height: e.target.clientHeight})
  }

    return (
      <Box id="lol" flex={1} flexGrow={1} minHeight={'100vh'} sx={{height: '100dvh', display: 'flex', flexDirection: 'column'}}>
        <CssBaseline/>
        <AppBar position="static" color='primary'>
            <Toolbar variant='dense'>
              <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="go back"
                  onClick={handleReturnToPreviousPage}
              >
                  <ArrowBack />
              </IconButton>
            
            
              <IconButton
                  size="large"
                  color="inherit"
                  aria-label="Delete"
                  onClick={deleteMainEventImage}
              >
                  <Delete />
              </IconButton>
              <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  align='center'
                  sx={{ flexGrow: 1}}
              >
                  {location.state.family.name} | {location.state.turn.turnName}
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

        <Box id="container" flexGrow={1} sx={{minHeight: '100%', height:'100%', display: 'flex', flexDirection: 'column', paddingTop: 1}} >
          <Grid component="section" justifyContent={"center"} sx={{display: "flex", padding: 0, margin: 0}} id="maine row stack">
            {/* Button left */}
            <Box display="flex" sx={{alignItems: 'center'}}>
              <ButtonBase sx={{display: 'flex', width: '100px'}}>
                <img src={button_left} style={{width: '100%'}}/>  
              </ButtonBase>
            </Box>
              <Box id="majne" sx={{display: 'flex', height:'100%'}}                   
                  onResize={onMainImageLoaded}
                  onResizeCapture={onMainImageLoaded}
                  onDrop={handleDropOnMainImage}
                  onDragOver={handleDragOver}
                   >
                <img
                  ref={observedMainImage}
                  id="main-image"
                  style={{maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain'}}
                  // className='turn-image'
                  draggable="false"
                  src={`${(turnEventMainImagePath || placeholder)}?${imageHash})`}
                  alt=""
                  onLoad={onMainImageLoaded}
                  onResize={onMainImageLoaded}
                  onResizeCapture={onMainImageLoaded}
                  />
              </Box>
              <Stack direction="column"
                  display={"flex"}
                  id="thumbnails-stack" 
                  spacing={{xs: 1}}
                  onDragEnter={(e) => handleDragEnter(e)} 
                  onDragLeave={(e) => handleLeave(e)} 
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleDropOnThumbnails(e)}
                  maxHeight={turnEventMainImageDimensions.height}
                  sx={{ padding: 0.5, overflowY: 'auto', maxWidth: '10%', zIndex: 99}}>
                {showedThumbnails.map((thumbnail) => (
                  <img
                    id="single-thumbnail"
                    className='single-thumbnail'
                    // srcSet={`${thumbnail.path}`}
                    src={`${thumbnail.path}?${imageHash}`}
                    alt="thumbnail"
                    loading="lazy"
                    onClick={(e) => displayTurnEventImage(thumbnail.id)}
                  />
                ))}
              </Stack>
            <Box display="flex" sx={{alignItems: 'center'}}>
              <ButtonBase sx={{display: 'flex', width: '100px'}}>
                <img src={button_right} style={{width: '100%'}}/>  
              </ButtonBase>
            </Box>
          </Grid>
            <Box height={0} flex={"1 1 auto"} display='flex' sx={{ margin:1, padding:1, backgroundColor: "white"}}>
              <DescriptionEditor familyId={familyId} turnId={turnId} overflow="hidden"/>
            </Box>
        </Box>

      </Box>
    );
  }