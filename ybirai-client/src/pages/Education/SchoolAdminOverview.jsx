import React from 'react'
import { motion } from 'framer-motion'
import { LoaderCircle, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "../../components/ui/dialog"
import AddSchools from '../AddSchools'

const SchoolAdminOverview = () => {
  const navigate = useNavigate();
  const [schoolDialogOpen, setSchoolDialogOpen] = React.useState(false);
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex gap-4 mb-8">
        <Dialog
          open={schoolDialogOpen}
          onOpenChange={(open) => {
            // Only allow closing through buttons
            if (open === false) return;
            setSchoolDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('schoolManagement.createSchool')}
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[600px] overflow-scroll"
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <AddSchools onClose={() => setSchoolDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate('/admin/education/add-course')}
        >
          <Plus className="w-4 h-4" />
          {t('schoolManagement.createCourse')}
        </Button>
      </div>
    </motion.div>
  );
}

export default SchoolAdminOverview;
