package browser

import "github.com/cnk3x/bolt"

type boltProvider struct{ bolt bolt.DB }

func (b *boltProvider) Meta() (any, error) {
	bolt, err := b.bolt.Bolt()
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"path":              b.bolt.Path(),
		"alloc_size":        bolt.AllocSize,
		"mlock":             bolt.Mlock,
		"freelist":          bolt.FreelistType,
		"no_grow_sync":      bolt.NoGrowSync,
		"no_freelist_sync":  bolt.NoFreelistSync,
		"no_sync":           bolt.NoSync,
		"pre_load_freelist": bolt.PreLoadFreelist,
		"strict_mode":       bolt.StrictMode,
		"mmap_flags":        bolt.MmapFlags,
	}, nil
}

func (b *boltProvider) List(keyPath [][]byte) (items []Entry, err error) {
	err = b.bolt.View(func(tx bolt.Tx) error {
		return tx.Scan(keyPath, nil, func(k, v []byte, isBucket bool) (err error) {
			items = append(items, Entry{Key: k, Value: v, Dir: isBucket})
			return
		})
	})

	return
}

func (b *boltProvider) Get(keyPath [][]byte) (data []byte, err error) {
	err = b.bolt.View(func(tx bolt.Tx) (err error) {
		data, err = tx.Get(keyPath)
		return
	})
	return
}

func (b *boltProvider) Set(keyPath [][]byte, value []byte) error {
	return b.bolt.Update(func(tx bolt.Tx) (err error) {
		return tx.Set(keyPath, value)
	})
}

func (b *boltProvider) Del(keyPath [][]byte) error {
	return b.bolt.Update(func(tx bolt.Tx) (err error) {
		return tx.Del(keyPath)
	})
}

func (b *boltProvider) CreateBucket(keyPath [][]byte) error {
	return b.bolt.Update(func(tx bolt.Tx) (err error) {
		return tx.CreateBucket(keyPath)
	})
}

func (b *boltProvider) Close() error {
	return b.bolt.Close()
}
