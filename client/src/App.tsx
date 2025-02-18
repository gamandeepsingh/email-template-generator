import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Loader2, Clipboard, Download, Send } from "lucide-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

interface Template {
  _id: string;
  name: string;
  subject: string;
  body: string;
  folder?: string;
  imageUrl?: string;
  recipient?: string;
}

interface FormData {
  name: string;
  subject: string;
  body: string;
  folder: string;
  imageUrl?: string;
  recipient?: string;
}

axios.defaults.baseURL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const App = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    subject: "",
    body: "",
    folder: "",
    imageUrl: "",
    recipient: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get<Template[]>("/");
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await axios.post(CLOUDINARY_API_URL, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: false,
      });

      setFormData((prev) => ({
        ...prev,
        folder: response.data.secure_url, // Store the actual image URL
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const url = editingId ? `/${editingId}` : `/`;
      const method = editingId ? "put" : "post";

      await axios[method](url, formData);
      await fetchTemplates();

      setFormData({
        name: "",
        subject: "",
        body: "",
        folder: "",
        imageUrl: "",
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/${id}`);
      await fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleEdit = (template: Template) => {
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      folder: template.folder || "",
      imageUrl: template.imageUrl || "", // Ensure imageUrl is properly assigned
    });
    setEditingId(template._id);
  };

  const copyToClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const htmlContent = generateHtml();
    navigator.clipboard.writeText(htmlContent);
    toast.success("HTML copied to clipboard!");
  };

  const downloadAsHtml = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const htmlContent = generateHtml();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${formData.name || "email-template"}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateHtml = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${formData.subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${formData.subject}</h2>
        <p>${formData.body.replace(/\n/g, "<br>")}</p>
        ${
          formData.folder
            ? `<img src="${formData.folder}" alt="Email Image" style="max-width: 100%; height: auto;">`
            : ""
        }
      </body>
      </html>
    `;
  };

  const sendViaGmail = () => {
    const mailtoLink = `mailto:${
      formData.recipient
    }?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      formData.body
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-black">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Template Manager
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Create and manage your email templates
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Body</label>
              <Textarea
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                required
                className="w-full min-h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                  disabled={isUploading}
                />
                {isUploading && (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isUploading}>
              {editingId ? "Update Template" : "Save Template"}
            </Button>

            {formData.name && formData.subject && formData.body && (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={copyToClipboard}>
                  <Clipboard className="h-4 w-4 sm:mr-2" /> Copy as HTML
                </Button>
                <Button variant="secondary" onClick={downloadAsHtml}>
                  <Download className="h-4 w-4 sm:mr-2" /> Download as HTML
                </Button>
              </div>
            )}

            {formData.body && formData.name && formData.subject &&  <div className="w-full">
              <Card className="p-4">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Recipient Email
                    </label>
                    <Input
                      name="recipient"
                      value={formData.recipient}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <Button variant="secondary" onClick={sendViaGmail}>
                    <Send className="h-4 w-4 mr-2" /> Send via Gmail
                  </Button>
                </form>
              </Card>
            </div>}
          </form>
        </Card>

        <Card className="p-4">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Live Preview</h2>
            <div className="border rounded p-4 space-y-2">
              <div className="font-medium">{formData.name}</div>
              <div className="text-lg">{formData.subject}</div>
              <div className="whitespace-pre-wrap">{formData.body}</div>
              {formData.folder && (
                <div className="mt-2">
                  <img
                    src={formData.folder}
                    alt="Template preview"
                    className="max-w-full h-auto max-h-[400px] rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Saved Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.length > 0 &&
            templates.map((template) => (
              <Card key={template._id} className="p-4 hover:bg-white/20">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {template?.folder && (
                      <div className="mt-2">
                        <img
                          src={template?.folder}
                          alt={template.name}
                          className="w-full sm:max-w-xs h-auto sm:h-20 rounded"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-black">{template.name}</div>
                      <div className="font-medium">
                        {template.subject.length > 40
                          ? template.subject.slice(0, 40) + "..."
                          : template.subject}
                      </div>
                      <div className="text-sm text-gray-400">
                        {template.body.trim().split("\n")[0]}...
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(template._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
