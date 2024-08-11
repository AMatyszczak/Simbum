import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useEffect, useState } from 'react';


const Img = styled('img')({
  margin: 'auto',
  display: 'block',
  maxWidth: '100%',
  maxHeight: '100%',
});

export default function AlbumGalleryComponent() {
    const [galleryData, setGalleryData] = useState([])

    useEffect(() => {
        window.electron.ipcRenderer.once('get-album-gallery-data', (arg: any) => {
            setGalleryData(arg);
            console.log("got albums:", arg)
        })

        window.electron.ipcRenderer.sendMessage('get-album-gallery-data', []);
    }, []) 

  return (
    <Grid container >
        {
        galleryData.map((data: any) => (
            <Paper
            sx={{
                p: 2,
                margin: 2,
                maxWidth: 500,
                flexGrow: 1,
                backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
            }}
            >
                <Grid container spacing={2}>
                    <Grid item>
                    <ButtonBase sx={{ width: 128, height: 128 }}>
                        <Img alt="complex" src={"file://" + data["imagePath"]} />
                    </ButtonBase>
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
                            <Grid item>
                                <Typography sx={{ cursor: 'pointer' }} variant="body2">
                                    Remove
                                </Typography>
                            </Grid>
                        </Grid>
                </Grid> 
                </Grid>
            </Paper>
            
        ))}
        {/* <Paper
        sx={{
            p: 2,
            margin: 'auto',
            maxWidth: 500,
            flexGrow: 1,
            backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        }}
        >
            <Grid container spacing={2}>
                <Grid item>
                <ButtonBase sx={{ width: 128, height: 128 }}>
                    <Img alt="complex" src="/static/images/grid/complex.jpg" />
                </ButtonBase>
                </Grid>
                <Grid item xs={12} sm container>
                <Grid item xs container direction="column" spacing={2}>
                    <Grid item xs>
                    <Typography gutterBottom variant="subtitle1" component="div">
                        Standard license
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        Full resolution 1920x1080 • JPEG
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ID: 1030114
                    </Typography>
                    </Grid>
                    <Grid item>
                    <Typography sx={{ cursor: 'pointer' }} variant="body2">
                        Remove
                    </Typography>
                    </Grid>
                </Grid>
                <Grid item>
                    <Typography variant="subtitle1" component="div">
                    $19.00
                    </Typography>
                </Grid>
                </Grid>
            </Grid>
        </Paper>
        */}
    </Grid>
  );
}