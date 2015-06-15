// cc $(pkg-config --libs --cflags libmodbus sqlite3) -lrt modbusTest.c
#include <stdio.h>
#include <modbus.h>
#include <errno.h>
#include <sqlite3.h>
#include <assert.h>
#include <signal.h>
#include <time.h>

modbus_t *ctx;
timer_t *modbus_result_timer;

volatile sig_atomic_t fatal_error_in_progress = 0;

void
fatal_error_signal (int sig)
{
  /* Since this handler is established for more than one kind of signal, 
     it might still get invoked recursively by delivery of some other kind
     of signal.  Use a static variable to keep track of that. */
  if (fatal_error_in_progress)
    raise (sig);
  fatal_error_in_progress = 1;
  /* Now do the clean up actions:
     - reset terminal modes
     - kill child processes
     - remove lock files */
  //timer_delete(&modbus_result_timer);
  modbus_free(ctx);
  /* Now reraise the signal.  We reactivate the signal’s
     default handling, which is to terminate the process.
     We could just call exit or abort,
     but reraising the signal sets the return status
     from the process correctly. */
  signal (sig, SIG_DFL);
  raise (sig);
}


int sqlite_cb(void* userdata, int num_columns, char** column_text_arr, char** column_name_arr) {
    assert(num_columns == 0);
}



int main() {
	printf( "I am alive!\n" );
	
	printf( "Creating DB... \n" );
	sqlite3 *db;
	if (sqlite3_open("butt.db", &db)){
		fprintf(stderr,"Can't open db: %s\n",sqlite3_errmsg(db));
	}
	
    sqlite3_exec(
        db,
        "CREATE TABLE IF NOT EXISTS powerdata ( time INTEGER UNIQUE, kilowatts REAL );",
        *sqlite_cb,
        NULL, //first arg to callback for userdata logic, I guess?
        NULL
    );
    
	//#ifdef RTUENABLED
	printf( "Connecting RTU\n" );
	ctx = modbus_new_rtu("/dev/ttyUSB0", 9600, 'N', 8, 1);
	modbus_rtu_set_serial_mode(ctx,MODBUS_RTU_RS485);
	/*#else
	printf( "Connecting TCP\n" );
	ctx = modbus_new_tcp("127.0.0.1",1502);
	#endif*/
	modbus_set_slave(ctx,0x0031);
	if (ctx == NULL) {
		fprintf(stderr, "Unable to create the libmodbus context\n");
		return -1;
	}
	
	if (modbus_connect(ctx) == -1){
		fprintf(stderr, "Connection failed: %s\n",modbus_strerror(errno));
		modbus_free(ctx);
		return -1;
	}
	//now we're connected; let's go
	
	uint16_t tab_reg[64];
	if (modbus_read_input_registers(ctx,1,1,tab_reg) == -1){
		fprintf(stderr, "Read failed: %s\n",modbus_strerror(errno));
		modbus_free(ctx);
		return -1;
	}
	printf("%f\n",(float)tab_reg[0]);
	
	//struct sigevent modbus_tick_event;
	
	//if (timer_create(CLOCK_MONOTONIC,
	
	struct sigaction action;
	
	action.sa_handler = fatal_error_signal;
	sigemptyset (&action.sa_mask);
	action.sa_flags = 0;
	sigaction (SIGINT, &action, NULL);
	
	while(1);
}


