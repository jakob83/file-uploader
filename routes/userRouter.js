const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const prisma = require('../prismaClient');
const getFolderTree = require('../utils/getFolderTree');
const { body, validationResult } = require('express-validator');
const unlinkFiles = require('../utils/unlinkFiles');
const userRouter = new Router();

userRouter.get('/', (req, res) => {
  res.redirect(`${req.user.id}/${req.user.rootDirId}`);
});
userRouter.get('/logout', (req, res) => {
  const { user } = req;
  req.logout(function (err) {
    if (err) {
      res.redirect(`/${user.id}`);
    }
  });
  res.redirect('/login');
});
userRouter.get('/:currDirId', async (req, res) => {
  const currDirId = req.params.currDirId;
  const dir = await prisma.directory.findUnique({
    where: {
      id: currDirId,
    },
    include: {
      files: true,
      subDirectories: true,
    },
  });
  const files = dir.files;
  const subDirs = dir.subDirectories;
  const folderTree = await getFolderTree(currDirId);
  res.render('home', {
    user: req.user,
    currDirId: req.params.currDirId,
    files: files,
    subDirs: subDirs,
    folderTree,
  });
});

userRouter.post('/:currDirId/createDirectory', async (req, res) => {
  // TODO: Implement directory creation logic
  const { currDirId } = req.params;
  const { user } = req;
  const { name } = req.body;
  try {
    const dir = await prisma.directory.create({
      data: {
        name: name,
        parent: { connect: { id: currDirId } },
      },
    });
    res.redirect(`/${user.id}/${currDirId}`);
  } catch (e) {
    res.redirect(`/${user.id}/${currDirId}?err=Directory already exists`);
  }
});

// Upload Files Logic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/' + path.join(__dirname, '../uploads', req.user.id));
  },
});
const upload = multer({ storage: storage });

userRouter.post(
  '/:currDirId/uploadFile',
  upload.single('file'),
  async (req, res) => {
    const { currDirId } = req.params;
    const { user } = req;
    const file = req.file;
    try {
      const filePrisma = await prisma.file.create({
        data: {
          name: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: `uploads/${user.id}/${file.filename}`,
          directory: {
            connect: {
              id: currDirId,
            },
          },
        },
      });
      res.redirect(`/${user.id}/${currDirId}`);
    } catch (err) {
      res.redirect(`/${user.id}/${currDirId}?err=Failed to upload`);
    }
  }
);

userRouter.post(
  '/:dirId/editDirectory',
  body('name').trim().not().isEmpty().withMessage('Name cannot be empty'),
  async (req, res) => {
    const referer = req.get('Referer');
    const { dirId } = req.params;
    const { name } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect(`${referer}?err="Name cannot be empty"`);
    }
    try {
      await prisma.directory.update({
        where: { id: dirId },
        data: { name: name },
      });
      return res.redirect(referer);
    } catch (err) {
      return res.redirect(`${referer}?err="Database Error"`);
    }
  }
);

userRouter.post('/:dirId/deleteDirectory', async (req, res) => {
  const referer = req.get('Referer');
  const { dirId } = req.params;
  try {
    await prisma.directory.deleteMany({ where: { parentId: dirId } });
    const filesToDelete = await prisma.file.findMany({
      where: { directoryId: dirId },
    });
    await prisma.file.deleteMany({
      where: { directoryId: dirId },
    });
    await unlinkFiles(filesToDelete);
    await prisma.directory.delete({ where: { id: dirId } });
    return res.redirect(referer);
  } catch (err) {
    console.log(err);
    return res.redirect(`${referer}?err="Database Error"`);
  }
});

userRouter.post(
  '/:dirId/editFile',
  body('name').trim().not().isEmpty().withMessage('Name cannot be empty'),
  async (req, res) => {
    const referer = req.get('Referer');
    const { dirId } = req.params;
    const { name } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect(`${referer}?err="Name cannot be empty"`);
    }
    try {
      await prisma.file.update({
        where: { id: dirId },
        data: { name: name },
      });
      return res.redirect(referer);
    } catch (err) {
      return res.redirect(`${referer}?err="Database Error"`);
    }
  }
);

userRouter.post('/:fileId/deleteFile', async (req, res) => {
  const referer = req.get('Referer');
  const { fileId } = req.params;
  try {
    const file = await prisma.file.delete({ where: { id: fileId } });
    await unlinkFiles([file]);
    return res.redirect(referer);
  } catch (err) {
    console.log(err);
    return res.redirect(`${referer}?err="Database Error"`);
  }
});

userRouter.post('/:fileId/downloadFile', async (req, res) => {
  const referer = req.get('Referer');
  const { fileId } = req.params;
  try {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    res.download(file.path, file.name);
  } catch (err) {
    console.log(err);
    return res.redirect(`${referer}?err="Database Error"`);
  }
});

module.exports = userRouter;
