package ui

import (
	"embed"
	"fmt"
	"io/fs"
	"os"
	"path"
	"strings"
)

//go:embed index.min.html favicon.svg ui.min.js ui.min.css
var ui embed.FS

var _ embed.FS

func UIFS(dir string) fs.FS {
	s := &uifs{}
	if dir != "" {
		s.UseFs(os.DirFS(dir))
	}
	s.Use(Index("index.min.html", "index.html"), Min(".css"), Min(".js"))
	s.UseFs(ui)
	return s
}

type uifs struct {
	fs          []fs.FS
	middlewares []func(fsys fs.FS, name string) (ok bool, f fs.File, err error)
}

func (s *uifs) UseFs(fss ...fs.FS) {
	s.fs = append(s.fs, fss...)
}

func (s *uifs) Use(mw ...func(fsys fs.FS, name string) (ok bool, f fs.File, err error)) {
	s.middlewares = append(s.middlewares, mw...)
}

func (s *uifs) open(name string) (f fs.File, err error) {
	for _, fs := range s.fs {
		if f, err = fs.Open(name); err == nil {
			return
		}
	}

	if err == nil || err == fs.ErrNotExist {
		err = fmt.Errorf("%w: %s", os.ErrNotExist, name)
	}
	return
}

func (s *uifs) Open(name string) (f fs.File, err error) {
	for _, mw := range s.middlewares {
		if ok, f, err := mw(FsOpen(s.open), name); ok {
			return f, err
		}
	}
	return s.open(name)
}

type FsOpen func(name string) (fs.File, error)

func (fo FsOpen) Open(name string) (fs.File, error) {
	if fo == nil {
		return nil, fs.ErrNotExist
	}
	return fo(name)
}

func Index(indexes ...string) func(fsys fs.FS, name string) (bool, fs.File, error) {
	return func(fsys fs.FS, name string) (done bool, f fs.File, err error) {
		if name == "index.html" || strings.HasSuffix(name, "/index.html") {
			dir := path.Dir(name)
			if dir == "." {
				dir = ""
			}
			for _, n := range indexes {
				n = path.Join(dir, n)
				if f, err = fsys.Open(n); err == nil {
					done = true
					return
				}
				if n == name {
					done = true
				}
			}
		}
		return
	}
}

func Min(ext string) func(fsys fs.FS, name string) (bool, fs.File, error) {
	return func(fsys fs.FS, name string) (done bool, f fs.File, err error) {
		if strings.HasSuffix(name, ext) {
			n := strings.TrimSuffix(name, ext)
			n = strings.TrimSuffix(n, ".min")
			for _, n := range []string{n + ".min" + ext, n + ext} {
				if f, err = fsys.Open(n); err == nil {
					break
				}
			}
			done = true
			return
		}
		return
	}
}
