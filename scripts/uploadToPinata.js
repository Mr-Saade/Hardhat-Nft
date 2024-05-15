require("dotenv").config();
const fs = require("fs");
const pinataSDK = require("@pinata/sdk");

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATE_API_SECRET
);
let ipfsHashes = [],
  files,
  tokenURIs = [];

async function uploadToPinata() {
  await uploadFiles();
  await uploadMetadata();
  console.log(`ipfsHases: ${ipfsHashes}`);
  console.log(`tokenURIs: ${tokenURIs}`);
}

async function uploadFiles() {
  console.log("Uploading images to Pinata for pinning...");
  const imagesFilePath = "./images/randomNFt";
  files = fs.readdirSync(imagesFilePath);

  for (const file in files) {
    try {
      const options = {
        pinataMetadata: {
          name: files[file],
        },
      };
      const readableStreamForFile = fs.createReadStream(
        `${imagesFilePath}/${files[file]}`
      );
      const res = await pinata.pinFileToIPFS(readableStreamForFile, options);
      console.log(` Image ${files[file]} pinned at ipfs://${res.IpfsHash}`);
      ipfsHashes.push(res.IpfsHash);
    } catch (err) {
      console.error(err);
    }
  }
  console.log("Images Pinned!");
}

async function uploadMetadata() {
  console.log("Uploading metadata to Pinata for pinning...");
  const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
      {
        trait_type: "Cuteness",
        value: null,
      },
    ],
  };
  for (const file in files) {
    try {
      const options = {
        pinataMetadata: {
          name: `${files[file]} Metatdata`,
        },
      };
      let body = { ...metadataTemplate };
      body.name = files[file].replace(".png", "");
      body.description = `A cute little ${body.name}`;
      body.image = `ipfs://${ipfsHashes[file]}`;
      body.attributes[0].value = getNftValue(body.name);
      const res = await pinata.pinJSONToIPFS(body, options);
      tokenURIs.push(res.IpfsHash);
    } catch (err) {
      console.error(err);
    }
  }
  console.log("Metadata Pinned!");
}

function getNftValue(nft) {
  let value;
  if (nft == "pug") {
    value = 99;
  } else if (nft == "shiba-inu") {
    value = 50;
  } else {
    value = 10;
  }
  return value;
}

uploadToPinata();
