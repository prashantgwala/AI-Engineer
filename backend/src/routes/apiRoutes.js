const express=require('express'); const multer=require('multer'); const path=require('path'); const c=require('../controllers/apiController');
const router=express.Router(); const storage=multer.diskStorage({destination:'uploads',filename:(_r,f,cb)=>cb(null,`${Date.now()}-${f.originalname.replace(/[^a-zA-Z0-9._-]/g,'_')}`)}); const upload=multer({storage,fileFilter:(_r,f,cb)=>/^(application\/pdf|image\/)/.test(f.mimetype)?cb(null,true):cb(new Error('Only PDF and image files are allowed')),limits:{fileSize:10*1024*1024}});
router.post('/documents/upload',upload.single('file'),c.upload); router.get('/feedback/analytics',c.analytics); router.post('/chat/new',c.newChat); router.post('/chat',c.chat); router.get('/chat',c.chatHistory); router.post('/chat/feedback',c.chatFeedback); router.get('/chat/track/:code',c.trackComplaint);
router.post('/complaints/register',upload.single('attachment'),c.complaintUpload);
router.get('/complaints/:id/history',c.complaintHistory); router.get('/files/:id/history',c.fileHistory);
router.get('/:table',c.list); router.post('/:table',c.create); router.get('/:table/:id',c.get); router.put('/:table/:id',c.update); router.delete('/:table/:id',c.remove);
module.exports=router;
