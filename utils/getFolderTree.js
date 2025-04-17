const prisma = require('../prismaClient');

module.exports = async function main(currDirId) {
  const arr = [];
  let currFolderId = currDirId;
  while (currFolderId != null) {
    let currFolder = await prisma.directory.findUnique({
      where: { id: currFolderId },
    });
    arr.push({ name: currFolder.name, id: currFolder.id });
    currFolderId = currFolder.parentId;
  }
  return arr.reverse();
};
