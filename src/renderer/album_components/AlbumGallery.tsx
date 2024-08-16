import { Grid, ButtonBase, Paper, Box, Typography, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { render } from "react-dom";
import { useLocation } from "react-router-dom";


const Img = styled('img')({
  margin: 'auto',
  display: 'block',
  maxWidth: '100%',
  maxHeight: '100%',
});

type LocationState = {
    state: {
        volume: {
            id: string;
            title: string;
        }
    }
}

export default function AlbumGallery() {

    const location = useLocation() as LocationState
    const [volume, setVolume] = useState<{
        id: string, 
        title: string, 
        albums: {id: string, imagePath: string}[]}>({id: "", title: "", albums: []})

    useEffect(() => {
        getAlbumGalleryData(location.state.volume.id)
    })


    function getAlbumGalleryData(volumeId: string){
        window.electron.ipcRenderer.once('get-album-gallery-data', (arg:any) => {
            console.log('getAlbumGalleryData, data:', arg)
            setVolume(arg)
        })


        window.electron.ipcRenderer.sendMessage('get-album-gallery-data', [volumeId])
    }

    return(
        <Grid container >
            {
            volume.albums.map((album: any) => (
                <ButtonBase sx={{margin: 2, maxWidth: 500, flexGrow: 1}}>
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
                                    <Img alt="complex" src={"file://" + album["imagePath"]} />
                                </Box>

                            </Grid>
                            <Grid item xs={12} sm container>
                                <Grid item xs container direction="column" spacing={2}>
                                    <Grid item xs>
                                        <Typography gutterBottom variant="subtitle1" component="div">
                                            {volume.title}
                                        </Typography>
                                    </Grid>
                                </Grid>
                        </Grid> 
                        </Grid>
                    </Paper>
                </ButtonBase>
            ))}
        </Grid>
    )
}