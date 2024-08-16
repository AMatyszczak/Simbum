import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const Img = styled('img')({
  margin: 'auto',
  display: 'block',
  maxWidth: '100%',
  maxHeight: '100%',
});

export default function VolumeGalleryComponent() {
    const navigate = useNavigate();
    const [galleryData, setGalleryData] = useState([])

    useEffect(() => {
        console.log("VolumeGallerycomponent")
        window.electron.ipcRenderer.once('get-volume-gallery-data', (arg: any) => {
            console.log("got volumes:", arg)
            setGalleryData(arg);
        })

        window.electron.ipcRenderer.sendMessage('get-volume-gallery-data', []);
    }, [])

    function onAlbumClick(e:any, volumeGalleryData: any){
        console.log("onAlbumClick", e, volumeGalleryData)
        navigate("/albumGallery", {state:{volume: volumeGalleryData}} )    
        console.log("after navigate")    
    }

    function onAlbumRemoveClick(e: any, albumData: any) {
        console.log("onAlbumRemoveClick", e, albumData)
        e.stopPropagation(); 
    }


    return (
        <Grid container >
            {
            galleryData.map((data: any) => (
                <ButtonBase sx={{margin: 2, maxWidth: 500, flexGrow: 1}}
                        onClick={(e) => onAlbumClick(e, data)}
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
                </ButtonBase>
            ))}
        </Grid>
    );
}