import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  ImageList,
  ImageListItem,
  Link,
  List,
  ListItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import algoliasearch from "algoliasearch";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "./App.css";
const algoliaSearch = algoliasearch(
  "V73DGUUTRU",
  "d40f34c7f6ce0b828ca5c72014615a7b",
);
const index = algoliaSearch.initIndex("problematic-driver-index");
function App() {
  const [drivers, setDrivers] = useState([]);
  const [driverIds, setDriverIds] = useState([]);
  const [fetching, setIsFetching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(undefined);
  const [selectedDriver, setSelectedDriver] = useState(undefined);
  const [selectedDriverId, setSelectedDriverId] = useState(undefined);
  const handleClose = useCallback(() => {
    setSelectedDriver(undefined);
    setSelectedDriverId(undefined);
  }, [setSelectedDriver, setSelectedDriverId]);
  useEffect(() => {
    if (selectedDriverId) {
      axios
        .get(
          `https://raw.githubusercontent.com/immacommitsudoku/problematic-driver-data/main/driver-data/${selectedDriverId}.json`,
        )
        .then((v) => {
          const driverPics = new Set(
            v.data.relatedReports.flatMap((d) => d.driverPics),
          );
          const driverCars = new Set(
            v.data.relatedReports.flatMap(
              (d) => `${d.vehicle.vehicleType} (${d.vehicle.plateNumber})`,
            ),
          );
          const driverPartners = new Set(
            v.data.relatedReports.flatMap((d) => d.partner),
          );
          setSelectedDriver({
            name: v.data.name,
            nik: v.data.nik,
            phoneNumer: v.data.phoneNumber,
            driverCars: [...driverCars],
            driverPics: [...driverPics],
            driverPartners: [...driverPartners],
            relatedReports: v.data.relatedReports,
          });
        });
    }
  }, [selectedDriverId]);
  useEffect(() => {
    if (driverIds && driverIds.length > 0) {
      Promise.allSettled(
        driverIds.map(async (id) => {
          const res = await axios.get(
            `https://raw.githubusercontent.com/immacommitsudoku/problematic-driver-data/main/driver-data/${id}.json`,
          );
          const driverPics = new Set(
            res.data.relatedReports.flatMap((d) => d.driverPics),
          );
          const driverCars = new Set(
            res.data.relatedReports.flatMap(
              (d) => `${d.vehicle.vehicleType} (${d.vehicle.plateNumber})`,
            ),
          );
          const driverPartners = new Set(
            res.data.relatedReports.flatMap((d) => d.partner),
          );
          return {
            name: res.data.name,
            nik: res.data.nik,
            phoneNumer: res.data.phoneNumber,
            driverCars: [...driverCars],
            driverPics: [...driverPics],
            driverPartners: [...driverPartners],
            relatedReports: res.data.relatedReports,
          };
        }),
      ).then((v) =>
        setDrivers(
          v.filter((v) => v.status === "fulfilled").map((v) => v.value),
        ),
      );
    }
  }, [driverIds]);
  const handleSearch = useCallback(() => {
    setDriverIds(undefined);
    setDrivers(undefined);
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
    }, 1500);
    if (searchKeyword && searchKeyword.length >= 4) {
      index
        .search(searchKeyword, {
          attributesToRetrieve: "id",
          hitsPerPage: 25,
        })
        .then((v) => {
          setDriverIds(v.hits.map((h) => h.id));
        });
    }
  }, [searchKeyword]);
  return (
    <>
      <Box
        alignItems={"center"}
        display="flex"
        padding={"25px 50px"}
        flexDirection="column"
        gap={2}
      >
        <Paper sx={{ width: "80%" }}>
          <Container sx={{ textAlign: "center" }}>
            <Typography variant="h3">Database Driver Bermasalah</Typography>
          </Container>
          <Container
            sx={{
              paddingTop: "25px",
              display: "flex",
              flexDirection: "row",
              gap: 1,
            }}
          >
            <TextField
              value={searchKeyword}
              onChange={(v) => {
                setSearchKeyword(v.target.value);
              }}
              label="NIK/Nama/Nomor HP"
              variant="outlined"
              fullWidth
            />
            <Button
              variant="contained"
              disabled={searchKeyword && searchKeyword.length < 4}
              onClick={handleSearch}
            >
              Cari
            </Button>
          </Container>
          <Container
            sx={{
              padding: "25px 0px",
              display: "flex",
              flexDirection: "row",
              gap: 1,
            }}
          >
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/immacommitsudoku/problematic-driver-data/issues/new?assignees=&labels=&projects=&template=laporan-driver-bermasalah.md&title="
            >
              Laporkan Driver Bermasalah
            </Link>
          </Container>
        </Paper>
        {fetching && <CircularProgress />}
        {!fetching && drivers && drivers.length > 0 && (
          <Container sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
            {drivers.map((d) => (
              <Paper
                sx={{
                  padding: "15px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <AvatarGroup max={2}>
                  {d.driverPics.map((p) => (
                    <Avatar
                      variant="rounded"
                      src={p}
                      sx={{ width: "100px", height: "100px" }}
                    />
                  ))}
                </AvatarGroup>
                <Grid
                  sx={{
                    padding: "15px",
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  {d.name && <Typography>Nama: {d.name}</Typography>}
                  {d.driverPartners && (
                    <Typography>Mitra: {d.driverPartners.join(",")}</Typography>
                  )}
                  {d.relatedReports && (
                    <Typography>
                      Histori Masalah:
                      {d.relatedReports.map((r) => r.title).join(",")}
                    </Typography>
                  )}
                </Grid>
                <Button
                  variant="contained"
                  onClick={() =>
                    setSelectedDriverId("9d6ec70c-6746-4f52-8e22-938d09f73e03")
                  }
                >
                  Tampilkan detil
                </Button>
              </Paper>
            ))}
          </Container>
        )}
      </Box>
      {selectedDriver && (
        <Dialog open={!!selectedDriver} maxWidth="xl" onClose={handleClose}>
          <DialogTitle>{selectedDriver.name}</DialogTitle>
          <DialogContent>
            <Container>
              <ImageList sx={{ width: "100%", height: "500px" }} cols={3}>
                {selectedDriver.driverPics.map((p, idx) => (
                  <ImageListItem key={idx}>
                    <img src={p} alt={idx} loading="lazy" />
                  </ImageListItem>
                ))}
              </ImageList>
              <Grid>
                <Typography variant="h5">Data Pribadi</Typography>
                <List
                  sx={{
                    width: "100%",
                    bgcolor: "background.paper",
                  }}
                >
                  {selectedDriver.nik && (
                    <ListItem>NIK: {selectedDriver.nik}</ListItem>
                  )}
                  {selectedDriver.phoneNumber && (
                    <ListItem>
                      Nomor Telepon: {selectedDriver.phoneNumber}
                    </ListItem>
                  )}
                </List>

                <Typography variant="h5">Mitra</Typography>
                <List
                  sx={{
                    width: "100%",
                    bgcolor: "background.paper",
                  }}
                >
                  {selectedDriver.driverPartners.map((p) => (
                    <ListItem>{p}</ListItem>
                  ))}
                </List>
                <Typography variant="h5">Kendaraan</Typography>
                <List
                  sx={{
                    width: "100%",
                    bgcolor: "background.paper",
                  }}
                >
                  {selectedDriver.driverCars.map((p) => (
                    <ListItem>{p}</ListItem>
                  ))}
                </List>
                <Typography variant="h5">Histori Masalah</Typography>
                <List
                  sx={{
                    width: "100%",
                    bgcolor: "background.paper",
                  }}
                >
                  {selectedDriver.relatedReports.map((p) => (
                    <ListItem>
                      <Typography
                        paddingX={1}
                      >{`${p.title} - ${p.datetime} - ${p.city}`}</Typography>
                      <Link href={p.reportLink}>Detil Laporan</Link>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Container>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default App;
