import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';


const Img = styled('img')({
  margin: 'auto',
  display: 'block',
  maxWidth: '100%',
  maxHeight: '100%',
});

export default function AlbumGalleryComponent() {
    const navigate = useNavigate();
    const [galleryData, setGalleryData] = useState([])

    useEffect(() => {
        window.electron.ipcRenderer.once('get-album-gallery-data', (arg: any) => {
            setGalleryData(arg);
            console.log("got albums:", arg)
        })

        window.electron.ipcRenderer.sendMessage('get-album-gallery-data', []);
    }, [])

    function onAlbumClick(e:any, albumData: any){
        console.log("onAlbumClick", e, albumData)
        navigate("/album", {state:{album: albumData}} )        

    }

    function onAlbumRemoveClick(e: any, albumData: any) {
        console.log("onAlbumRemoveClick", e, albumData)
        e.stopPropagation (); 
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

                                <Box display="flex" sx={{ width: 32, height: 32 }} >
                                    <Img alt="complex" src={"file://" + data["imagePath"]} /> nooby sie rodza
                                </Box>


                                <Box display="flex" sx={{ width: 32, height: 32 }} >
                                    <Img alt="complex" src={"file://" + data["imagePath"]} /> noby sie bawią
                                </Box>


                                <Box display="flex" sx={{ width: 32, height: 32 }} >
                                    <Img alt="complex" src={"file://" + data["imagePath"]} /> noby sie umierają 
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