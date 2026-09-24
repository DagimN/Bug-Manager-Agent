import { SamplePreset } from '@/types';

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'react-null-pointer',
    name: 'React Null Pointer',
    language: 'React / TypeScript',
    environment: 'Production',
    description: 'Uncaught TypeError when accessing properties of undefined user object during component lifecycle render.',
    log: `Uncaught TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (http://localhost:3000/static/js/bundle.js:14205:28)
    at renderWithHooks (http://localhost:3000/static/js/bundle.js:28310:18)
    at mountIndeterminateComponent (http://localhost:3000/static/js/bundle.js:32145:13)
    at beginWork (http://localhost:3000/static/js/bundle.js:33678:16)
    at HTMLUnknownElement.callCallback (http://localhost:3000/static/js/bundle.js:18942:14)
    at Object.invokeGuardedCallbackDev (http://localhost:3000/static/js/bundle.js:18991:16)

Component Stack:
    in UserList (created by Dashboard)
    in div (created by Dashboard)
    in Dashboard (created by App)
    in Route (created by App)
    in Router (created by BrowserRouter)

State payload at crash:
{
  "userState": {
    "isLoading": false,
    "data": null,
    "error": null
  }
}`
  },
  {
    id: 'nodejs-unhandled-rejection',
    name: 'Node.js Unhandled Rejection',
    language: 'Node.js / Express',
    environment: 'Production',
    description: 'Unhandled Promise Rejection caused by downstream microservice connection timeout without try/catch block.',
    log: `(node:24819) UnhandledPromiseRejectionWarning: Error: ETIMEDOUT connect 10.0.4.12:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1146:16)
    --------------------------------------------------
    at Protocol.handshake (/app/node_modules/pg/lib/client.js:134:24)
    at Client._connect (/app/node_modules/pg/lib/client.js:82:11)
    at Client.connect (/app/node_modules/pg/lib/client.js:98:12)
    at Pool._connect (/app/node_modules/pg-pool/index.js:84:11)
    at Pool.connect (/app/node_modules/pg-pool/index.js:170:10)
    at AuthService.validateSession (/app/dist/services/AuthService.js:48:33)
    at async /app/dist/middleware/auth.js:22:20

(node:24819) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch().
(node:24819) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.`
  },
  {
    id: 'db-pool-timeout',
    name: 'DB Connection Pool Timeout',
    language: 'PostgreSQL / Knex',
    environment: 'Staging',
    description: 'Database connection pool exhausted due to unreleased connections in high-concurrency API route.',
    log: `KnexTimeoutError: Timeout acquiring a connection from pool. Pool size: 10, Active: 10, Waiting: 45.
    at /app/node_modules/knex/lib/client.js:278:14
    at processTicksAndRejections (internal/process/task_queues.js:95:5)
    at async OrderRepository.createOrder (/app/dist/repositories/OrderRepository.js:89:24)
    at async OrderController.checkout (/app/dist/controllers/OrderController.js:34:12)

Details:
[2026-09-24T12:04:18.891Z] FATAL: remaining connection slots are reserved for non-replication superuser connections
Client ID: order-service-prod-78b9c48b7d-x2lq9
Context: Transaction opened inside loop without await client.release() or knex.destroy() block.`
  },
  {
    id: 'python-fastapi-deadlock',
    name: 'Python Asyncio Deadlock',
    language: 'Python / FastAPI',
    environment: 'Production',
    description: 'Asyncio event loop blocked by synchronous CPU-bound task in async endpoint causing worker timeout.',
    log: `[2026-09-24 13:12:04 +0000] [18492] [CRITICAL] WORKER TIMEOUT (pid:18492)
[2026-09-24 13:12:04 +0000] [18492] [ERROR] Exception in ASGI application
Traceback (most recent call last):
  File "/usr/local/lib/python3.11/site-packages/uvicorn/protocols/http/h11_impl.py", line 408, in run_asgi
    result = await app(self.scope, self.receive, self.send)
  File "/usr/local/lib/python3.11/site-packages/fastapi/applications.py", line 276, in __call__
    await super().__call__(scope, receive, send)
  File "/app/api/endpoints/analytics.py", line 54, in generate_report
    report_data = sync_heavy_dataframe_processing(raw_logs) # Blocking call in async context!
  File "/app/services/data_processor.py", line 112, in sync_heavy_dataframe_processing
    df.apply(complex_regex_transform, axis=1)
asyncio.exceptions.CancelledError: Task <Task pending name='Task-42' coro=<RequestResponseCycle.run_asgi()>> was cancelled.`
  },
  {
    id: 'go-nil-pointer',
    name: 'Go Nil Pointer Dereference',
    language: 'Go / Gin',
    environment: 'Staging',
    description: 'Runtime panic caused by calling method on nil pointer interface in payment processing gateway.',
    log: `2026/09/24 13:20:11 [Recovery] 2026/09/24 - 13:20:11 panic recovered:
runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x18 pc=0x7f48b9]

goroutine 64 [running]:
main.processPayment(0x0, 0xc00018e000, 0x1)
	/app/services/payment.go:87 +0x65
main.PaymentHandler(0xc00021a000)
	/app/handlers/checkout.go:42 +0x12a
github.com/gin-gonic/generic.(*Context).Next(...)
	/go/pkg/mod/github.com/gin-gonic/gin@v1.9.1/context.go:174
github.com/gin-gonic/gin.CustomRecoveryWithWriter.func1(...)
	/go/pkg/mod/github.com/gin-gonic/gin@v1.9.1/recovery.go:102
net/http.HandlerFunc.ServeHTTP(...)
	/usr/local/go/src/net/http/server.go:2136`
  }
];
