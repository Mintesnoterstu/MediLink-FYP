import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, TextField, Button, List, ListItem, ListItemText, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel } from '@mui/material';
import { Add, Edit, Delete, Article, SmartToy, LocalHospital } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { HealthCard, PrimaryButton } from '@/components/ui';

interface ContentItem {
  id: string;
  type: 'article' | 'ai-template' | 'symptom-guide';
  title: string;
  content: string;
  language: 'en' | 'am';
  published: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface ContentCuratorProps {
  contentItems?: ContentItem[];
  onContentCreate?: (content: Omit<ContentItem, 'id' | 'createdAt'>) => Promise<void>;
  onContentUpdate?: (content: ContentItem) => Promise<void>;
  onContentDelete?: (contentId: string) => Promise<void>;
}

export const ContentCurator: React.FC<ContentCuratorProps> = ({
  contentItems = [],
  onContentCreate,
  onContentUpdate,
  onContentDelete,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    type: 'article',
    title: '',
    content: '',
    language: 'en',
    published: false,
  });

  const filteredContent = contentItems.filter((item) => {
    if (activeTab === 0) return item.type === 'article';
    if (activeTab === 1) return item.type === 'ai-template';
    if (activeTab === 2) return item.type === 'symptom-guide';
    return true;
  });

  const handleOpenDialog = (content?: ContentItem) => {
    if (content) {
      setEditingContent(content);
      setFormData(content);
    } else {
      setEditingContent(null);
      setFormData({
        type: activeTab === 0 ? 'article' : activeTab === 1 ? 'ai-template' : 'symptom-guide',
        title: '',
        content: '',
        language: 'en',
        published: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingContent(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingContent) {
        await onContentUpdate?.({ ...editingContent, ...formData, updatedAt: new Date().toISOString() } as ContentItem);
      } else {
        await onContentCreate?.(formData as Omit<ContentItem, 'id' | 'createdAt'>);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (window.confirm(t('admin.confirmDeleteContent'))) {
      try {
        await onContentDelete?.(contentId);
      } catch (error) {
        console.error('Failed to delete content:', error);
      }
    }
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'article':
        return <Article />;
      case 'ai-template':
        return <SmartToy />;
      case 'symptom-guide':
        return <LocalHospital />;
    }
  };

  return (
    <Box>
      <HealthCard
        title={t('admin.contentCurator')}
        action={
          <Button
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            variant="outlined"
            size="small"
          >
            {t('admin.addContent')}
          </Button>
        }
      >
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab label={t('admin.articles')} icon={<Article />} iconPosition="start" />
          <Tab label={t('admin.aiTemplates')} icon={<SmartToy />} iconPosition="start" />
          <Tab label={t('admin.symptomGuides')} icon={<LocalHospital />} iconPosition="start" />
        </Tabs>

        {filteredContent.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            {t('admin.noContent')}
          </Typography>
        ) : (
          <List>
            {filteredContent.map((item) => (
              <ListItem
                key={item.id}
                sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 1 }}
                secondaryAction={
                  <Box>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(item)}
                      sx={{ mr: 1 }}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(item.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </Box>
                }
              >
                <Box sx={{ mr: 2 }}>{getTypeIcon(item.type)}</Box>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {item.title}
                      </Typography>
                      <Chip
                        label={item.published ? t('admin.published') : t('admin.draft')}
                        size="small"
                        color={item.published ? 'success' : 'default'}
                      />
                      <Chip label={item.language.toUpperCase()} size="small" />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {item.content.substring(0, 100)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        {t('admin.created')}: {new Date(item.createdAt).toLocaleDateString()}
                        {item.updatedAt && ` | ${t('admin.updated')}: ${new Date(item.updatedAt).toLocaleDateString()}`}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </HealthCard>

      {/* Content Edit/Create Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingContent ? t('admin.editContent') : t('admin.addContent')}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('admin.title')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            multiline
            rows={10}
            label={t('admin.content')}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal"
            required
          />
          <Box display="flex" gap={2} mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.published || false}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />
              }
              label={t('admin.published')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <PrimaryButton onClick={handleSubmit}>
            {t('common.save')}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
