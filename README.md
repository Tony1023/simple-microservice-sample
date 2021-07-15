# simple-microservice-sample

A simplified 3-microservice E-commerce project that uses kafka and gRPC to communicate between services and to achieve orchestrated SAGA.

## TODO list
- [x] Finish the todo list
- [x] Simplistic databases that reset everytime they are booted up
- [ ] REST endpoints with some classic operations (make order, register, etc.)
  - [ ] Account service -*In progress*-
  - [ ] Order service -*In progress*-
  - [ ] Inventory service
- [ ] gRPC communication stuff (implement under the logic layer)
- [x] kafka set up
- [x] Orchestrated SAGA (in place of distributed transactions)
- [ ] Idempotency (since kafka uses at-least-once)
- [ ] Client, like unit tests
- [ ] Complete README (installation instructions, how to run tests, extensibility etc.)
