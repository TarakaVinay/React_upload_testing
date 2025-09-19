import React, { useState } from "react";
import { Upload, Button, message, Card } from "antd";
import { UploadOutlined, EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import exifr from "exifr";

function App() {
  const [fileList, setFileList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDetails, setImageDetails] = useState(null);

  const extractMetadata = async (file) => {
    try {
      const metadata = await exifr.parse(file, { gps: true });

      // ✅ Log entire EXIF metadata to console for debugging
      console.log("📸 Full EXIF Metadata:", metadata);

      // 📸 Get Date from EXIF or fallback to file.lastModified
      let dateTaken = metadata?.DateTimeOriginal
        ? metadata.DateTimeOriginal.toLocaleString()
        : new Date(file.lastModified).toLocaleString();

      // 🌍 Get GPS location from EXIF or fallback to browser location
      let location = "Unknown";

      if (metadata?.latitude && metadata?.longitude) {
        location = `Lat: ${metadata.latitude.toFixed(6)}, Lng: ${metadata.longitude.toFixed(6)}`;
      } else {
        // Fallback: use browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              setImageDetails((prev) => ({
                ...prev,
                location: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
              }));
              console.log("🌎 Browser Location Fallback:", latitude, longitude);
            },
            (err) => {
              console.warn("Geolocation not available:", err);
            }
          );
        }
      }

      setImageDetails({
        name: file.name,
        dateTaken,
        location,
      });

      // ✅ Log final extracted details
      console.log("✅ Extracted Details:", {
        name: file.name,
        dateTaken,
        location,
      });

    } catch (error) {
      console.error("❌ Error reading metadata:", error);
      setImageDetails({
        name: file.name,
        dateTaken: new Date(file.lastModified).toLocaleString(),
        location: "Unknown",
      });
    }
  };

  const props = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    async onChange(info) {
      let newFileList = [...info.fileList];
      setFileList(newFileList);

      if (info.file.status !== "uploading" && info.file.originFileObj) {
        const file = info.file.originFileObj;
        setImagePreview(URL.createObjectURL(file));
        await extractMetadata(file);
      }
    },
    fileList,
    customRequest({ file, onSuccess }) {
      setTimeout(() => {
        onSuccess("ok");
      }, 500);
    },
    showUploadList: false,
  };

  return (
    <div className="App" style={{ textAlign: "center", marginTop: 40 }}>
      <Card
        style={{
          maxWidth: 500,
          margin: "0 auto",
          padding: 20,
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/4211/4211740.png"
          alt="upload"
          style={{ width: 60, marginBottom: 10 }}
        />
        <h2>Upload Images</h2>
        <p style={{ color: "#888" }}>Click the button below to start uploading images</p>

        <Upload {...props}>
          <Button type="primary" icon={<UploadOutlined />} size="large">
            Open Upload Dialog
          </Button>
        </Upload>

        {imagePreview && (
          <div style={{ marginTop: 20 }}>
            <img
              src={imagePreview}
              alt="preview"
              style={{ maxWidth: "100%", borderRadius: 12, marginBottom: 10 }}
            />
            {imageDetails && (
              <div style={{ textAlign: "left", marginTop: 10 }}>
                <p><b>File      : </b> {imageDetails.name}</p>
                <p><ClockCircleOutlined /> <b>Date Taken: </b> {imageDetails.dateTaken}</p>
                <p><EnvironmentOutlined /> <b>Location:</b> {imageDetails.location}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default App;