import '../App.css';
import 'react-quill/dist/quill.snow.css';
import DescriptionEditor from '../album_components/DescriptionEditor';
import TitleEditor from '../album_components/TitleEditor';
import SettingsButtonComponent from '../settings/SettingsButtonComponent';
import button_right from '../../../assets/buttons/button_right.png';
import button_right_plus from '../../../assets/buttons/button_right_plus.png';
import button_left from '../../../assets/buttons/button_left.png';
import button_left_plus from '../../../assets/buttons/button_left_plus.png';
import placeholder from '../../../assets/img_placeholder.png';
import 'react-quill/dist/quill.snow.css';
import React, { useEffect, useState } from 'react';
import { Link, Location, useLocation } from 'react-router-dom';


type Album = {
  id: string;
  no: number;
  imagesIds: string[]
}


type LocationState = {
  state: {
    family: {
      id: string
    }
    album: {
      id: string;
      title: string;
      description: string;
      imagePath: string;
    };
  }
}

export default function AlbumComponent() {
  // const [albumsList, setAlbumsList] = useState<{id: string}[]>([])
  const [albumNo, setAlbumNo] = useState<number>(0)
  const [pagesLoaded, setPagesLoaded] = useState<boolean>(false)
  const [displayedImageNo, setDisplayedImageNo] = useState<number>(0)
  // const [pageNo, setPageNo] = useState<number>(0)
  const [pageId, setPageId] = useState<string>('0')
  const [album, setAlbum] = useState<Album>({id: "0", no: 0, imagesIds: []})
  const [pagesList, setPagesList] = useState<{id: string, filename: string, path: string}[]>([])
  const [imageHash, setImageHash] = useState(Date.now())
  const [currentImagePath, setCurrentImagePath] = useState('')
  const [savedThumbnails, setSavedThumbnails] = useState<{path: string, filename: string, id: string}[]>([])
  const [showedThumbnails, setShowedThumbnails] = useState<{path: string, filename: string, id: string}[]>([])
  const [draggedElement, setDraggedElement] = useState<{path: string, filename: string, id: string}>({path: '', filename: '', id: ''})
  const [isDragging, setIsDrawing] = useState(false)
  const [indexOfDraggedElement, setIndexOfDraggedElement] = useState(-1)
  
  const location = useLocation() as LocationState;
  const familyId: string = location.state.family.id

  useEffect(() => {
    loadAlbumById(location.state.family.id, location.state.album.id)

  }, [])
  

  // function loadAlbums() {
  //   window.electron.ipcRenderer.once('get-album-map', (arg: any) => {
  //     setAlbumsList(arg);
  //     console.log("loadAlbums:", arg)
  //     if(location.state != null) {
  //       console.log("loadAlbums, location.state:", location.state.album.albumId)
  //       loadAlbumById(location.state.album.albumId, 0)
  //     } else {
  //       loadAlbumById(arg[0].id, 0)
  //     }
  //     console.log("Event, get-album-map, albumsList:", arg)
  //   })
  //   window.electron.ipcRenderer.sendMessage('get-album-map', []);
  // }

  function loadAlbumById(familyId: string, albumId: string) {
    window.electron.ipcRenderer.once('get-album', (arg: any) => {
      console.log("loadAlbumById:", familyId, albumId)
      setAlbum(album)
      setPagesLoaded(true)
      setDisplayedImageNo(0)
      // setPageNo(pageNo)

      // setAlbumNo(pageNo)
      loadAlbumImages(familyId, albumId, true)
    });
    window.electron.ipcRenderer.sendMessage('get-album', [familyId, albumId]);  
  }

  function loadAlbumByIndex(index: number) {
    window.electron.ipcRenderer.once('get-album', (arg: any) => {
      console.log("loadAlbumByIndex get-album, index:", index, "arg:", arg)
      
      setAlbum(arg) 
      setPagesLoaded(true)
      setDisplayedImageNo(0)
      // setAlbumNo(index)
      loadAlbumImages(familyId, arg.id, true)
    });
    window.electron.ipcRenderer.sendMessage('get-album', [album.id]);  
  }

  function onNextAlbumClick() {
    if (isLastImageDisplayed()) {
      createNewAlbum(albumNo + 1);
    } else {
      loadAlbumByIndex(albumNo + 1);
    }
  }

  function onPrevAlbumClick() {
    if (isFirstImageDisplayed()) {
      createNewAlbum(albumNo);
    } else {
      loadAlbumByIndex(albumNo - 1);
    }
  }

  function createNewAlbum(index: number) {
    window.electron.ipcRenderer.once('get-album-map', (arg: any) => {
      // setAlbumsList(familyId, arg);
      loadAlbumById(familyId, arg[index].id)
      loadAlbumImages(familyId, arg[index].id, true)
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
    console.log("deleteCurrentPage click: length:", pagesList.length)
    if(pagesList.length >= 1) {
      console.log("deleteCurrentPage albumId:", album.id, "pageId:", pageId)
      window.electron.ipcRenderer.sendMessage('page-image-deleted', [album.id, pageId]);
      loadAlbumImages(familyId, album.id, true)
    }

  }
  
  function handleDropOnMainImage(e: any) {
    e.preventDefault()
    
    setIsDrawing(false)
    
    const file = e.dataTransfer.files.item(0);

    if (file.type.includes('image/')) {
      setCurrentImagePath(`file://${file.path}`);

      if(pageId != null) {
        window.electron.ipcRenderer.sendMessage('page-image-changed', [
          album.id,
          pageId,
          file.path,
        ]);
      }
      
      loadAlbumImages(familyId, album.id, false);
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
        loadAlbumImages(familyId, album.id, false);
      }); 
      
      window.electron.ipcRenderer.sendMessage('page-image-added', [
        album.id,
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

  function loadAlbumImages(familyId: string, albumId: string, showFirstPage: boolean) {
    window.electron.ipcRenderer.once('get-album-images', (arg: any) => {
      console.log("loadAlbumImages get-album-images, arg:", arg, "albumId:", albumId )
      const thumbnails: {path: string, filename: string, id: string}[] = arg ? arg : []
      console.log("loadAlbumImages, thumbnails:", thumbnails)
      if(thumbnails.length >0) {
        if(showFirstPage === true) {
          setImageHash(Date.now())
          setPageId(thumbnails[0].id)
          setCurrentImagePath(thumbnails[0].path)
          setPagesList(thumbnails)
          setSavedThumbnails(thumbnails)
          setShowedThumbnails(thumbnails)
        } else {
          setImageHash(Date.now())
          setPagesList(thumbnails)
          setSavedThumbnails(thumbnails)
          setShowedThumbnails(thumbnails)
        }
      } else {
          setCurrentImagePath("")
          setPagesList([])
          setSavedThumbnails([])
          setShowedThumbnails([])
      }
    });
    window.electron.ipcRenderer.sendMessage('get-album-images', [familyId, albumId]);
  }

  function moveToPage(pageId: string) {
    const pageNo: any = pagesList.findIndex((e: any) => e.id == pageId.toString())

    if(pageNo != -1) {
      setPageId(pagesList[pageNo].id)
      setCurrentImagePath(pagesList[pageNo].path)
    }
  }

  if (!pagesLoaded) {return <div className='loader'/>}
  else
    return (
      <>
        <SettingsButtonComponent onTrashClick={deleteCurrentPage} />
        <div className="album-content">
          <TitleEditor albumId={album.id} />
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
                  onClick={onNextAlbumClick}
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
                  onClick={onPrevAlbumClick}
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
          <DescriptionEditor albumId={album.id} />
        </div>
      </>
    );
  }