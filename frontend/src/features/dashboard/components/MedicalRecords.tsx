import { useState } from 'react';
import type { Theme } from '@mui/material/styles';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    useTheme,
    Tabs,
    Tab,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import MedicationIcon from '@mui/icons-material/Medication';
import BiotechIcon from '@mui/icons-material/Biotech';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PrintIcon from '@mui/icons-material/Print';

const RecordsCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    '&:hover': {
        boxShadow: theme.shadows[4],
    },
}));

const RecordItem = styled(ListItem)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    '&:not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

interface MedicalRecord {
    id: string;
    title: string;
    type: 'lab' | 'prescription' | 'report' | 'hospital' | 'immunization';
    date: string;
    provider: string;
    description: string;
}

const records: MedicalRecord[] = [
    {
        id: 'rec1',
        title: 'Blood Test Results',
        type: 'lab',
        date: 'Sept 15, 2024',
        provider: 'Central Lab',
        description: 'CBC, Lipid Panel, Blood Sugar',
    },
    {
        id: 'rec2',
        title: 'Metformin Prescription',
        type: 'prescription',
        date: 'Aug 10, 2024',
        provider: 'Dr. Tesfaye',
        description: '500mg, Twice daily',
    },
    {
        id: 'rec3',
        title: 'Dental X-Ray',
        type: 'report',
        date: 'June 20, 2024',
        provider: 'Dr. Sara Abebe',
        description: 'Annual dental checkup results',
    },
    {
        id: 'rec4',
        title: 'Discharge Summary',
        type: 'hospital',
        date: 'Jan 12, 2024',
        provider: "St. Paul's Hospital",
        description: 'ER Visit for fracture',
    },
];

const getRecordIcon = (type: string) => {
    switch (type) {
        case 'lab':
            return <BiotechIcon />;
        case 'prescription':
            return <MedicationIcon />;
        case 'report':
            return <DescriptionIcon />;
        case 'hospital':
            return <LocalHospitalIcon />;
        default:
            return <DescriptionIcon />;
    }
};

const getRecordColor = (type: string, theme: Theme) => {
    switch (type) {
        case 'lab':
            return theme.palette.info.light;
        case 'prescription':
            return theme.palette.success.light;
        case 'hospital':
            return theme.palette.error.light;
        default:
            return theme.palette.primary.light;
    }
};

export const MedicalRecords = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setAnchorEl(event.currentTarget);
        setActiveRecordId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setActiveRecordId(null);
    };

    const handleDownload = (record: MedicalRecord) => {
        const blob = new Blob(
            [JSON.stringify(record, null, 2)],
            { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${record.title.replace(/\s+/g, '_')}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handlePrint = (record: MedicalRecord) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
          <html>
            <head>
              <title>${record.title}</title>
            </head>
            <body>
              <h2>${record.title}</h2>
              <p><strong>Date:</strong> ${record.date}</p>
              <p><strong>Provider:</strong> ${record.provider}</p>
              <p><strong>Type:</strong> ${record.type}</p>
              <p><strong>Description:</strong> ${record.description}</p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const activeRecord = activeRecordId
        ? records.find(r => r.id === activeRecordId) || null
        : null;

    return (
        <RecordsCard>
            <CardContent sx={{ flexGrow: 1, p: 0 }}>
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" fontWeight={600}>
                            Medical Records
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<DescriptionIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            All Records
                        </Button>
                    </Box>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 1 } }}
                    >
                        <Tab label="Recent" />
                        <Tab label="Labs" />
                        <Tab label="Prescriptions" />
                        <Tab label="Hospital" />
                    </Tabs>
                </Box>

                <List disablePadding>
                    {records.map((record) => (
                        <RecordItem key={record.id}>
                            <ListItemIcon>
                                <Avatar
                                    sx={{
                                        bgcolor: `${getRecordColor(record.type, theme)}33`,
                                        color: theme.palette.getContrastText(`${getRecordColor(record.type, theme)}33`),
                                    }}
                                >
                                    {getRecordIcon(record.type)}
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {record.title}
                                    </Typography>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {record.date} • {record.provider}
                                        </Typography>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                            {record.description}
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Box>
                                <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                                    <IconButton size="small" title="View">
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        title="Download"
                                        onClick={() => handleDownload(record)}
                                    >
                                        <DownloadIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" title="Share">
                                        <ShareIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuClick(e, record.id)}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </RecordItem>
                    ))}
                </List>
            </CardContent>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    View
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (activeRecord) handleDownload(activeRecord);
                        handleMenuClose();
                    }}
                >
                    <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                    Download
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                    Share
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (activeRecord) handlePrint(activeRecord);
                        handleMenuClose();
                    }}
                >
                    <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
                    Print
                </MenuItem>
            </Menu>
        </RecordsCard>
    );
};

export default MedicalRecords;
