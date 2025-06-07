import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill'; // Import Quill
import 'react-quill/dist/quill.snow.css';
import api, { BACKEND_URL } from '../../services/api'; // Import api and BACKEND_URL

// Custom Iframe Blot
const BlockEmbed = Quill.import('blots/block/embed');

class IframeBlot extends BlockEmbed {
  static create(value) { // value is the URL for the iframe
    let node = super.create();
    node.setAttribute('src', value); // Set src attribute with the URL
    node.setAttribute('frameborder', '0');
    node.setAttribute('allowfullscreen', true);
    // Set default width and height, can be overridden by formatText if needed
    node.setAttribute('width', '100%'); 
    node.setAttribute('height', '700px'); // Default height for embedded iframe
    // node.setAttribute('title', 'Embedded content'); // Optional: set a title
    return node;
  }

  static value(node) {
    return node.getAttribute('src'); // Store the src URL as the blot's value
  }
}
IframeBlot.blotName = 'iframe'; // This is the name used in insertEmbed
IframeBlot.tagName = 'iframe';
Quill.register(IframeBlot);
console.log("Custom IframeBlot registered.");


class RichTextEditor extends Component {
  constructor(props) {
    super(props);
    this.quillRef = React.createRef();

    this.modules = {
      toolbar: {
        container: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'align': [] }], // Add alignment options
          ['link', 'image', 'video', 'pdf'], // Add 'pdf' button
          ['clean']
        ],
        handlers: {
          'pdf': this.pdfUploadHandler,
        }
      },
    };

    this.formats = [
      'header',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet',
      'link', 'image', 'video',
      'iframe', // Add iframe for PDF embedding
      'align', // Add align format
      // 'pdf' // Add if using custom PdfBlot
    ];
  }

  pdfUploadHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', '.pdf');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('contentPdfFile', file); // Key must match backend (uploadModulePdf.single('contentPdfFile'))

      try {
        const response = await api.post('/admin/upload-content-pdf', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data && response.data.status === 'success' && response.data.data.url) {
          const pdfUrl = response.data.data.url;
          const fullPdfUrl = `${BACKEND_URL}${pdfUrl}`; // Construct full URL for iframe src

          const quill = this.quillRef.current.getEditor();
          const range = quill.getSelection(true);
          
          console.log('Embedding PDF URL:', fullPdfUrl); // Log the URL

          // Insert an iframe to embed the PDF
          // Adjust width and height as needed.
          // Using a simple iframe for now. For a richer experience like in "img 2",
          // a dedicated PDF viewer component would be needed on the display side.
          quill.insertEmbed(range.index, 'iframe', fullPdfUrl, Quill.sources.USER);
          quill.formatText(range.index, 1, { width: '100%', height: '700px' }); // Re-enable to set width/height
          quill.insertText(range.index + 1, '\n', Quill.sources.USER); // Add a newline after the embed

          // If using a custom blot:
          // quill.insertEmbed(range.index, 'pdf', { url: fullPdfUrl, name: file.name }, Quill.sources.USER);
        } else {
          console.error('PDF upload failed:', response.data.message || 'Unknown error');
          alert(`Gagal mengunggah PDF: ${response.data.message || 'Error tidak diketahui'}`);
        }
      } catch (error) {
        console.error('Error uploading PDF:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat mengunggah PDF.';
        alert(`Error: ${errorMessage}`);
      }
    };
  }

  render() {
    const { value, onChange } = this.props;
    return (
      <ReactQuill
        ref={this.quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={this.modules}
        formats={this.formats}
        placeholder="Tulis konten modul di sini..."
      />
    );
  }
}

export default RichTextEditor;
