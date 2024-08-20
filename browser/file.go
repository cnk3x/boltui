package browser

import (
	"io/fs"
	"os"
	"slices"
	"strings"
)

func List(dir string) ([]string, error) {
	cur, err := os.Open(dir)
	if err != nil {
		return nil, err
	}
	defer cur.Close()

	dirs, err := cur.ReadDir(-1)
	if err != nil {
		return nil, err
	}

	slices.SortFunc(dirs, func(a, b fs.DirEntry) int {
		if a.IsDir() != b.IsDir() {
			return If(a.IsDir(), -1, 1)
		}
		return strings.Compare(a.Name(), b.Name())
	})

	return Map(dirs, func(item os.DirEntry) string {
		return If(item.IsDir(), item.Name()+"/", item.Name())
	}), nil
}
