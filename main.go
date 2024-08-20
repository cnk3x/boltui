package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"

	"github.com/cnk3x/boltui/browser"
	"github.com/cnk3x/boltui/ui"
	"github.com/cnk3x/ws"
)

func main() {

	addr := flag.String("l", "127.0.0.1:0", "web listen addr")
	boltPath := flag.String("f", "", "boltdb file path")
	dir := flag.String("u", "", "ui dir")
	debug := flag.Bool("d", false, "ui dir")

	flag.Parse()

	if *debug {
		slog.SetLogLoggerLevel(slog.LevelDebug)
	}

	if *boltPath == "" && flag.NArg() == 0 {
		flag.Usage()
		return
	}

	if *boltPath == "" {
		*boltPath = flag.Arg(0)
	}

	se := browser.Bolt(*boltPath)
	defer se.Close()

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	http.Handle("GET /", http.FileServer(http.FS(ui.UIFS(*dir))))
	http.Handle("POST /api", se)
	http.Handle("GET /select", http.HandlerFunc(se.Select))

	s := ws.Serve(ctx, *addr, nil)

	if s.Listen != nil {
		if tcp, _ := s.Listen.(*net.TCPAddr); tcp != nil {
			slog.Info("started", "address", "http://localhost:"+strconv.Itoa(tcp.Port))
		} else {
			slog.Info("started", "address", "http://"+s.Listen.String())
		}
	}

	if err := s.Wait(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	fmt.Println("done!")
}
