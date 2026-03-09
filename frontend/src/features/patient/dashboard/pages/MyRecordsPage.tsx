import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import { useUI } from '@/contexts/UIContext';

export const MyRecordsPage: React.FC = () => {
  const { language } = useUI();
  const isAmharic = language === 'am';
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; type: string; data?: Record<string, unknown> }>({
    open: false,
    type: '',
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isAmharic ? 'የሕክምና መዝገቦቼ' : 'MY HEALTH RECORDS'}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የግል መረጃ' : 'Personal Information'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isAmharic ? 'መስክ' : 'Field'}</TableCell>
                <TableCell>{isAmharic ? 'ዋጋ' : 'Value'}</TableCell>
                <TableCell>{isAmharic ? 'የተረጋገጠው በ' : 'Verified By'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                {
                  enField: 'Full Name',
                  amField: 'ሙሉ ስም',
                  enValue: 'Almaz Kebede',
                  amValue: 'አልማዝ ከበደ',
                  enVerified: 'Jimma Hospital',
                  amVerified: 'ጅማ ሆስፒታል',
                },
                {
                  enField: 'Date of Birth',
                  amField: 'የትውልድ ቀን',
                  enValue: '15/04/1990',
                  amValue: '15/04/1990',
                  enVerified: 'Jimma Hospital',
                  amVerified: 'ጅማ ሆስፒታል',
                },
                {
                  enField: 'Gender',
                  amField: 'ጾታ',
                  enValue: 'Female',
                  amValue: 'ሴት',
                  enVerified: 'Jimma Hospital',
                  amVerified: 'ጅማ ሆስፒታል',
                },
                {
                  enField: 'Blood Type',
                  amField: 'የደም አይነት',
                  enValue: 'O+',
                  amValue: 'ኦ ፕላስ',
                  enVerified: 'Dr. Tadesse (Jan 10, 2026)',
                  amVerified: 'ዶ/ር ታደሰ (ጃንዋሪ 10፣ 2026)',
                },
                {
                  enField: 'Allergies',
                  amField: 'አለርጂዎች',
                  enValue: 'Penicillin',
                  amValue: 'ፔኒሲሊን',
                  enVerified: 'Dr. Tadesse (Jan 10, 2026)',
                  amVerified: 'ዶ/ር ታደሰ (ጃንዋሪ 10፣ 2026)',
                },
                {
                  enField: 'Emergency Contact',
                  amField: 'የድንገተኛ አደጋ መጠናኛ',
                  enValue: 'Tekle Kebede - 0911-234-567',
                  amValue: 'ተክሌ ከበደ - 0911-234-567',
                  enVerified: 'Self-reported',
                  amVerified: 'በራስ ሪፖርት የተደረገ',
                },
              ].map((row) => (
                <TableRow key={row.enField}>
                  <TableCell>{isAmharic ? row.amField : row.enField}</TableCell>
                  <TableCell>{isAmharic ? row.amValue : row.enValue}</TableCell>
                  <TableCell>{isAmharic ? row.amVerified : row.enVerified}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የሕክምና ታሪክ' : 'Medical History'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                  <TableCell>{isAmharic ? 'ቀን' : 'Date'}</TableCell>
                  <TableCell>{isAmharic ? 'ሁኔታ/ምርመራ' : 'Condition/Diagnosis'}</TableCell>
                  <TableCell>{isAmharic ? 'አገልግሎት ሰጪ' : 'Provider'}</TableCell>
                  <TableCell>{isAmharic ? 'ማስታወሻ' : 'Notes'}</TableCell>
                  <TableCell>{isAmharic ? 'እርምጃ' : 'Action'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                [
                  'Jan 10, 2026',
                  'ጃንዋሪ 10፣ 2026',
                  'Malaria',
                  'ወባ',
                  'Dr. Tadesse Bekele',
                  'ዶ/ር ታደሰ በቀለ',
                  'Confirmed by blood test. Treated with Coartem.',
                  'በደም ምርመራ የተረጋገጠ። በኮአርተም ታክሟል።',
                  'View Details',
                  'detail',
                ],
                [
                  'Dec 5, 2025',
                  'ዲሴምበር 5፣ 2025',
                  'Hypertension Screening',
                  'የደም ግፊት ምርመራ',
                  'Dr. Abebech Mohammed',
                  'ዶ/ር አበበች መሐመድ',
                  'BP 130/85 - borderline. Lifestyle modification advised.',
                  'BP 130/85 - ድንበር ላይ ያለ። የአኗኗር ዘይቤ ማስተካከል ተመክሯል።',
                  'View Details',
                  'detail',
                ],
                [
                  'Aug 20, 2025',
                  'ኦገስት 20፣ 2025',
                  'COVID-19 Vaccination',
                  'ኮቪድ-19 ክትባት',
                  'Jimma Health Center',
                  'ጅማ ጤና ጣቢያ',
                  'Dose 2 of Pfizer',
                  'የፋይዘር ክትባት 2ኛ ዙር',
                  'View Certificate',
                  'certificate',
                ],
              ].map((r) => (
                <TableRow key={r[0] as string}>
                  <TableCell>{isAmharic ? r[1] : r[0]}</TableCell>
                  <TableCell>{isAmharic ? r[3] : r[2]}</TableCell>
                  <TableCell>{isAmharic ? r[5] : r[4]}</TableCell>
                  <TableCell>{isAmharic ? r[7] : r[6]}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() =>
                        setDetailDialog({
                          open: true,
                          type: r[9] as string,
                          data: {
                            date: r[0],
                            condition: r[2],
                            provider: r[4],
                            notes: r[6],
                          },
                        })
                      }
                    >
                      {isAmharic ? 'ዝርዝሮችን ይመልከቱ' : r[8]}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የአሁኑ መድሀኒቶች' : 'Current Medications'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                  <TableCell>{isAmharic ? 'መድሀኒት' : 'Medication'}</TableCell>
                  <TableCell>{isAmharic ? 'መጠን' : 'Dosage'}</TableCell>
                  <TableCell>{isAmharic ? 'የታዘዘለት ሐኪም' : 'Prescribed By'}</TableCell>
                  <TableCell>{isAmharic ? 'አሁን ሁኔታ' : 'Status'}</TableCell>
                  <TableCell>{isAmharic ? 'እርምጃ' : 'Action'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                [
                  'Amoxicillin',
                  'አሞክሲሲሊን',
                  '500mg twice daily',
                  '500ሚግራም በቀን ሁለት ጊዜ',
                  'Dr. Tadesse Bekele',
                  'Jan 10, 2026',
                  'Jan 30, 2026',
                  'Active',
                ],
                [
                  'Paracetamol',
                  'ፓራሲታሞል',
                  '500mg as needed',
                  '500ሚግራም እንደአስፈላጊነቱ',
                  'Dr. Tadesse Bekele',
                  'Jan 10, 2026',
                  'Ongoing',
                  'Active',
                ],
              ].map((m) => (
                <TableRow key={m[0]}>
                  <TableCell>{isAmharic ? m[1] : m[0]}</TableCell>
                  <TableCell>{isAmharic ? m[3] : m[2]}</TableCell>
                  <TableCell>{m[4]}</TableCell>
                  <TableCell>{isAmharic ? 'ንቁ' : m[7]}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() =>
                        setDetailDialog({
                          open: true,
                          type: 'medication',
                          data: { medication: m[0], dosage: m[2], prescribedBy: m[4] },
                        })
                      }
                    >
                      {isAmharic ? 'ይመልከቱ' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {isAmharic ? 'የላብራቶሪ ውጤቶች' : 'Lab Results'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                  <TableCell>{isAmharic ? 'ቀን' : 'Date'}</TableCell>
                  <TableCell>{isAmharic ? 'የምርመራ ስም' : 'Test Name'}</TableCell>
                  <TableCell>{isAmharic ? 'ውጤት' : 'Result'}</TableCell>
                  <TableCell>{isAmharic ? 'መደበኛ ወሰን' : 'Normal Range'}</TableCell>
                  <TableCell>{isAmharic ? 'ላብራቶሪ' : 'Lab'}</TableCell>
                  <TableCell>{isAmharic ? 'እርምጃ' : 'Action'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['Jan 10, 2026', 'Malaria Rapid Test', 'POSITIVE', 'Negative', 'Jimma Hospital Lab'],
                ['Jan 10, 2026', 'Complete Blood Count', 'Normal', '-', 'Jimma Hospital Lab'],
              ].map((r) => (
                <TableRow key={r[1] as string}>
                  <TableCell>{r[0]}</TableCell>
                  <TableCell>{r[1]}</TableCell>
                  <TableCell>{isAmharic && r[1] === 'Malaria Rapid Test' ? 'አዎንታዊ' : r[2]}</TableCell>
                  <TableCell>{isAmharic && r[3] === 'Negative' ? 'አሉታዊ' : r[3]}</TableCell>
                  <TableCell>{isAmharic ? 'የጅማ ሆስፒታል ላብራቶሪ' : r[4]}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() =>
                        setDetailDialog({
                          open: true,
                          type: 'lab',
                          data: {
                            date: r[0],
                            testName: r[1],
                            result: r[2],
                            lab: r[4],
                          },
                        })
                      }
                    >
                      {isAmharic ? 'ሪፖርት ይመልከቱ' : 'View Report'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="warning">
          {isAmharic ? 'እርማት ይጠይቁ' : 'REQUEST CORRECTION'}
        </Button>
        {isAmharic && <Chip sx={{ ml: 1 }} label="እርማት ይጠይቁ" />}
      </Box>

      <Alert severity="warning" sx={{ mt: 2 }}>
        {isAmharic
          ? '⚠️ የሕክምና መዝገቦችዎን እየተመለከቱ ነው። እነዚህ መዝገቦች በጤና ባለሙያዎች የተጨመሩ ናቸው እና በታካሚዎች በቀጥታ ሊስተካከሉ አይችሉም። ማንኛውም መረጃ የተሳሳተ ነው ብለው ካመኑ፣ እባክዎ “እርማት ይጠይቁ” የሚለውን አዝራር ይጠቀሙ።'
          : '⚠️ You are viewing your medical records. These records are added by healthcare professionals and cannot be edited directly by patients. If you believe any information is incorrect, please use the \"Request Correction\" button.'}
      </Alert>

      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog((p) => ({ ...p, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {detailDialog.type === 'certificate'
            ? isAmharic
              ? 'የማረጋገጫ ሰነድ'
              : 'Certificate'
            : detailDialog.type === 'medication'
              ? isAmharic
                ? 'የመድሀኒት ዝርዝሮች'
                : 'Medication Details'
              : detailDialog.type === 'lab'
                ? isAmharic
                  ? 'የላብ ሪፖርት'
                  : 'Lab Report'
                : isAmharic
                  ? 'የሕክምና ዝርዝሮች'
                  : 'Record Details'}
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Box sx={{ pt: 1 }}>
              {detailDialog.type === 'certificate' && (
                <Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>{isAmharic ? 'ቀን' : 'Date'}:</strong> {String(detailDialog.data.date)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>{isAmharic ? 'ሁኔታ' : 'Condition'}:</strong> {String(detailDialog.data.condition)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>{isAmharic ? 'አገልግሎት ሰጪ' : 'Provider'}:</strong> {String(detailDialog.data.provider)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>{isAmharic ? 'ማስታወሻ' : 'Notes'}:</strong> {String(detailDialog.data.notes)}
                  </Typography>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {isAmharic
                      ? 'ይህ የኮቪድ-19 ክትባት ማረጋገጫ ሰነድ ነው።'
                      : 'This is a valid COVID-19 vaccination certificate.'}
                  </Alert>
                </Box>
              )}
              {(detailDialog.type === 'detail' || detailDialog.type === 'medication' || detailDialog.type === 'lab') && (
                <Stack spacing={1}>
                  {Object.entries(detailDialog.data).map(([key, val]) => (
                    <Typography key={key} variant="body1">
                      <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {String(val)}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog((p) => ({ ...p, open: false }))}>
            {isAmharic ? 'ዝጋ' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

