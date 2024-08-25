import '../App.css';
import 'react-quill/dist/quill.snow.css';
import DescriptionEditor from './DescriptionEditor';
import TurnNameEditor from './TurnNameEditor';
import SettingsButtonComponent from '../settings/SettingsButtonComponent';
import button_right from '../../../assets/buttons/button_right.png';
import button_right_plus from '../../../assets/buttons/button_right_plus.png';
import button_left from '../../../assets/buttons/button_left.png';
import button_left_plus from '../../../assets/buttons/button_left_plus.png';
import placeholder from '../../../assets/img_placeholder.png';
import 'react-quill/dist/quill.snow.css';
import React, { useEffect, useState } from 'react';
import { Link, Location, useLocation, useNavigate } from 'react-router-dom';
import { ArrowBack, Add, Delete } from '@mui/icons-material';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';


type Album = {
  id: string;
  no: number;
  imagesIds: string[]
}


type LocationState = {
  state: {
    family: {
      id: string;
      name: string;
    }
    turn: {
      turnId: string;
      title: string;
      description: string;
      imagePath: string;
    };
  }
}

export default function TurnComponent() {
  
  const navigate = useNavigate();
  const location = useLocation() as LocationState;
  const familyId: string = location.state.family.id;
  const turnId: string = location.state.turn.turnId;
  const [turnEventImageId, setTurnEventImageId] = useState<string>('0')
  const [turnImages, setTurnEventsImages] = useState<{id: string, filename: string, path: string}[]>([])
  

  const [albumNo, setAlbumNo] = useState<number>(0)
  const [pagesLoaded, setPagesLoaded] = useState<boolean>(false)
  const [displayedImageNo, setDisplayedImageNo] = useState<number>(0)
  const [turn, setTurn] = useState<Album>({id: "0", no: 0, imagesIds: []})
  const [imageHash, setImageHash] = useState(Date.now())
  const [currentImagePath, setCurrentImagePath] = useState('')
  const [savedThumbnails, setSavedThumbnails] = useState<{path: string, filename: string, id: string}[]>([])
  const [showedThumbnails, setShowedThumbnails] = useState<{path: string, filename: string, id: string}[]>([])
  const [draggedElement, setDraggedElement] = useState<{path: string, filename: string, id: string}>({path: '', filename: '', id: ''})
  const [isDragging, setIsDrawing] = useState(false)
  const [indexOfDraggedElement, setIndexOfDraggedElement] = useState(-1)
 
  const handleReturnToPreviousPage = () => navigate(-1)


  useEffect(() => {
    loadTurnById(familyId, turnId)
  }, [])


  function loadTurnById(familyId: string, turnId: string) {
    window.electron.ipcRenderer.once('get-turn', (arg: any) => {
      console.log("loadTurnById, get-album: arg:", arg)
      setTurn(turn)
      setPagesLoaded(true)
      setDisplayedImageNo(0)

      loadTurnImages(familyId, turnId, true)
    });
    window.electron.ipcRenderer.sendMessage('get-turn', [familyId, turnId]);  
  }

  function loadTurnByIndex(index: number) {
    window.electron.ipcRenderer.once('get-turn', (arg: any) => {
      console.log("loadTurnByIndex get-album, index:", index, "arg:", arg)
      
      setTurn(arg) 
      setPagesLoaded(true)
      setDisplayedImageNo(0)
      // setAlbumNo(index)
      loadTurnImages(familyId, arg.id, true)
    });
    window.electron.ipcRenderer.sendMessage('get-turn', [familyId, turn.id]);  
  }

  function onNextTurnClick() {
    if (isLastImageDisplayed()) {
      createNewTurn(albumNo + 1);
    } else {
      loadTurnByIndex(albumNo + 1);
    }
  }

  function onPrevTurnClick() {
    if (isFirstImageDisplayed()) {
      createNewTurn(albumNo);
    } else {
      loadTurnByIndex(albumNo - 1);
    }
  }

  function createNewTurn(index: number) {
    window.electron.ipcRenderer.once('get-album-map', (arg: any) => {
      loadTurnById(familyId, arg[index].id)
      loadTurnImages(familyId, arg[index].id, true)
    })
    window.electron.ipcRenderer.sendMessage('create-album', [index]);
  }

  function isLastImageDisplayed(): boolean {
    return showedThumbnails.length - 1 <= displayedImageNo
  }

  function isFirstImageDisplayed(): boolean {
    return displayedImageNo <= 0 
  }

  function deleteCurrentPage(): any {
    console.log("deleteCurrentPage click: length:", turnImages.length)
    if(turnImages.length >= 1) {
      console.log("deleteCurrentPage albumId:", turn.id, "pageId:", turnEventImageId)
      window.electron.ipcRenderer.sendMessage('page-image-deleted', [turn.id, turnEventImageId]);
      loadTurnImages(familyId, turn.id, true)
    }
  }
  
  function handleDropOnMainImage(e: any) {
    e.preventDefault()
    
    setIsDrawing(false)
    
    const file = e.dataTransfer.files.item(0);

    if (file.type.includes('image/')) {
      setCurrentImagePath(`file://${file.path}`);

      if(turnImages.length > 0) {
        window.electron.ipcRenderer.sendMessage('add-turn-image', [
          familyId,
          turnId,
          0,
          file.path
        ])
      } else {
        if(turnEventImageId != null) {
          window.electron.ipcRenderer.sendMessage('update-turn-image', [
            turnId,
            turnEventImageId,
            0,
            file.path,
          ]);
        }
      }
      
      loadTurnImages(familyId, turn.id, false);
    }
    e.stopPropagation()
  }

  function handleDropOnThumbnails(e: any) {
    e.preventDefault()
    if(e.target.className == "album-image-thumbnail-container" || e.target.className == "album-image-thumbnail-list") {
      setIsDrawing(false)
      setShowedThumbnails([...savedThumbnails]) 
    }

    setIsDrawing(false)
    const file = e.dataTransfer.files.item(0);
    if (file.type.includes('image/')) {
      window.electron.ipcRenderer.once('get-album-images', (arg: any) => {
        loadTurnImages(familyId, turn.id, false);
      }); 
      
      window.electron.ipcRenderer.sendMessage('update-turn-image', [
        turn.id,
        indexOfDraggedElement,
        file.path
      ])

    } 
    e.stopPropagation();
  }; 

  function handleDragOver(e: any) {
    e.preventDefault();

    if (isDragging) {
      let parentElement: any = e.target.className == 'album-image-thumbnail-list' ? e.target : e.target.parentElement

      const postionOfImageOnThumbnails = determinePositionOfImage(parentElement, e.clientX, false)

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

    if(isDragging && e.relatedTarget.className != "album-image-thumbnail-container" && e.relatedTarget.className != "album-image-thumbnail-list") {
      setIsDrawing(false)
      setShowedThumbnails([...savedThumbnails])
      setIndexOfDraggedElement(-1)
    }

    e.stopPropagation();
  };

  function handleDragEnter(e: any) {
    e.preventDefault();

    if (e.target.parentElement.className == "album-image-thumbnail-list" && !isDragging) {
      const postionOfImageOnThumbnails = determinePositionOfImage(e.target.parentElement, e.clientX, false)
      
      let thumbs: {path: string, filename: string, id: string}[] = [...savedThumbnails]
      let ele = {
        path: "file:///home/adrian/Desktop/SimBumStaff/img_placeholder.png",
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

  function determinePositionOfImage(parentElement: any, clientX: any, addImageWith: boolean) {
    let imageWidth = 120 + 8;
    let parentElementBoundRect = parentElement.getBoundingClientRect()

    const scrollLeft = parentElement.scrollLeft;
    let relativeX = clientX - parentElementBoundRect.left + scrollLeft;    
    if (addImageWith) {
      relativeX += imageWidth;
    }
    
    let postionOfImage = Math.floor(relativeX/imageWidth)
    if (postionOfImage < 0 ) {
      postionOfImage = 0
    }
    return postionOfImage
  }

  function loadTurnImages(familyId: string, albumId: string, showFirstPage: boolean) {
    window.electron.ipcRenderer.once('get-album-images', (arg: any) => {
      console.log("loadAlbumImages get-album-images, arg:", arg, "albumId:", albumId )
      const thumbnails: {path: string, filename: string, id: string}[] = arg ? arg : []
      console.log("loadAlbumImages, thumbnails:", thumbnails)
      if(thumbnails.length >0) {
        if(showFirstPage === true) {
          setImageHash(Date.now())
          setTurnEventImageId(thumbnails[0].id)
          setCurrentImagePath(thumbnails[0].path)
          setTurnEventsImages(thumbnails)
          setSavedThumbnails(thumbnails)
          setShowedThumbnails(thumbnails)
        } else {
          setImageHash(Date.now())
          setTurnEventsImages(thumbnails)
          setSavedThumbnails(thumbnails)
          setShowedThumbnails(thumbnails)
        }
      } else {
          setCurrentImagePath("")
          setTurnEventsImages([])
          setSavedThumbnails([])
          setShowedThumbnails([])
      }
    });
    window.electron.ipcRenderer.sendMessage('get-album-images', [familyId, albumId]);
  }

  function moveToPage(pageId: string) {
    const pageNo: any = turnImages.findIndex((e: any) => e.id == pageId.toString())

    if(pageNo != -1) {
      setTurnEventImageId(turnImages[pageNo].id)
      setCurrentImagePath(turnImages[pageNo].path)
    }
  }

  if (!pagesLoaded) {return <div className='loader'/>}
  else
    return (
      <>

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
                aria-label="go back"
                sx={{ mr: 2 }}
                // onClick={handleReturnToPreviousPage}
            >
                <Delete />
            </IconButton>
            
            
            <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: 'none', sm: 'block' } }}
                align="center"
            >
                Tury {location.state.family.name}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            </Toolbar>
        </AppBar>


        {/* <SettingsButtonComponent onTrashClick={deleteCurrentPage} /> */}
        <div className="album-content">
          <TurnNameEditor familyId={familyId} turnId={turnId} />
          <div className='image-viewer-view'>        
            <div className="album-images-controller">
              <button
                className="next-album-image-button"
                type="button"
              >
                <img
                  src={isLastImageDisplayed() ? button_left_plus : button_left}
                  className="button-image"
                  alt=""
                  onClick={onNextTurnClick}
                  draggable="false"
                />
              </button>
              <div
                className="album-image-container"
                onDrop={(e) => handleDropOnMainImage(e)}
                onDragOver={(e) => handleDragOver(e)}
              >
                <img
                  draggable="false"
                  className="album-image"
                  src={`${(currentImagePath || placeholder)}?${imageHash})`}
                  alt=""
                />
              </div>
              <button
                className="prev-album-image-button"
                type="button"
              >
                <img
                  src={
                    isFirstImageDisplayed() ? button_right_plus : button_right
                  }
                  className="button-image"
                  alt=""
                  onClick={onPrevTurnClick}
                  draggable="false"
                />

              </button>
            </div>
            <div className='album-image-thumbnail-list' 
              onDragEnter={(e) => handleDragEnter(e)} 
              onDragLeave={(e) => handleLeave(e)} 
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDropOnThumbnails(e)} 
              >
                {
                  showedThumbnails.map((thumbnail) => (
                    <div className='album-image-thumbnail-container'>
                      <img 
                        draggable="false"
                        src={`${thumbnail.path}?${imageHash}`}
                        key={thumbnail.id} 
                        className={isDragging ? "album-image-thumbnail thumbnail-drag-overlay" : "album-image-thumbnail"} 
                        onClick={(e) => moveToPage(thumbnail.id)}
                      />
                    </div>
                  ))
                }
              </div>
          </div>
          <DescriptionEditor turnId={turn.id} />
        </div>
      </>
    );
  }