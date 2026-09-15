import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function musicUploadPlugin(): Plugin {
  const handleUpload = (req: any, res: any) => {
    if (req.method === 'POST') {
      const rawHeaderName = req.headers['x-file-name'] || req.headers['x-filename'] || 'uploaded_track.mp3';
      let originalName = 'uploaded_track.mp3';
      try {
        originalName = decodeURIComponent(Array.isArray(rawHeaderName) ? rawHeaderName[0] : rawHeaderName);
      } catch {
        originalName = String(rawHeaderName);
      }

      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      req.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          if (buffer.length === 0) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Tệp tải lên rỗng (0 bytes).' }));
            return;
          }

          const musicDir = path.resolve(process.cwd(), 'public/music');
          if (!fs.existsSync(musicDir)) {
            fs.mkdirSync(musicDir, { recursive: true });
          }

          const timestamp = Date.now();
          const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
          const finalFileName = `${timestamp}_${cleanName}`;
          const filePath = path.join(musicDir, finalFileName);

          fs.writeFileSync(filePath, buffer);

          // Also sync to dist/music if dist exists
          const distMusicDir = path.resolve(process.cwd(), 'dist/music');
          if (fs.existsSync(distMusicDir)) {
            try {
              fs.writeFileSync(path.join(distMusicDir, finalFileName), buffer);
            } catch (distErr) {
              console.warn('Could not write to dist/music:', distErr);
            }
          }

          // Update manifest.json
          const manifestPath = path.join(musicDir, 'manifest.json');
          let manifest: any[] = [];
          if (fs.existsSync(manifestPath)) {
            try {
              manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            } catch {
              manifest = [];
            }
          }

          const newEntry = {
            fileName: finalFileName,
            relativePath: `/music/${finalFileName}`,
            title: originalName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
            artist: 'Quản trị viên tải lên',
            category: 'lofi',
            bpm: null,
            sizeKb: Math.round(buffer.length / 1024),
            notes: 'Tệp âm thanh do quản trị viên tải lên thực tế',
            uploadedAt: new Date().toISOString()
          };

          manifest.unshift(newEntry);
          fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            audioUrl: `/music/${finalFileName}`,
            fileName: finalFileName,
            originalFileName: originalName,
            fileSizeBytes: buffer.length
          }));
        } catch (err: any) {
          console.error('Upload write error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi khi lưu tệp âm thanh vào máy chủ.' }));
        }
      });
      return;
    }

    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Chỉ chấp nhận phương thức POST' }));
  };

  const handleGetFiles = (req: any, res: any) => {
    try {
      const manifestPath = path.resolve(process.cwd(), 'public/music/manifest.json');
      if (fs.existsSync(manifestPath)) {
        const content = fs.readFileSync(manifestPath, 'utf-8');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(content);
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([]));
      }
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
  };

  return {
    name: 'music-upload-plugin',
    configureServer(server) {
      server.middlewares.use('/api/upload-music', handleUpload);
      server.middlewares.use('/api/project-music-files', handleGetFiles);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/upload-music', handleUpload);
      server.middlewares.use('/api/project-music-files', handleGetFiles);
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), musicUploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
