# Kubernetes

## Introduction

>Kubernetes, also known as K8s, is an open source system for automating deployment, scaling, and management of containerized applications. (1)

While the above definition/summary of Kubernetes is helpful, it doesn't fully encapsulate this revolutionary and widespread technology. Kubernetes has changed how deployment and management of scalable software works in a big way.

## History and Context

To give some context to this system, Kubernetes was created in 2014 by Google engineers. Later, Kubernetes joined the Cloud Native Computing Foundation (CNCF) in 2016 (2). The name Kubernetes is a Greek term that means pilot or helmsman (1), which is fitting considering how it controls and manages software systems.

Kubernetes is the second largest open source project in the world (1), just behind Linux! And today, around 71% of Fortune 100 companies use Kubernetes as their primary container orchestration tool.

## Architecture

To understand Kubernetes, we first need to understand containers.

>Modern-day containers are defined as units of software where application code is packaged with all its libraries and dependencies. (3)

Containers were created basically as a replacement for virtual machines. Virual machines allow a user to simulate a computer with specific specifications and systems that would otherwise be difficult or impossible on their single real computer. Containers are faster and more portable than virtual machines, and encapsulate an operating system rather than simulating an entire machine.

Here is the heirarchy of the Kubernetes architecture (1):

- **Cluster** - the top level
  - **Control Plane Nodes** - run/manage the cluster
    - **API Server** - exposes the Kubernetes REST API and scales horizontally by deploying more instances
    - **Controller Manager** - runs the various controllers like the Node Controller and Job Controller
    - **Cloud Controller Manager** - manages the connection between the cluser and the user's cloud provider (if applicable)
    - **Scheduler** - assigns new nodes to a specific pod
    - **ETCD** - a key-value store that holds cluster configuration, state, and metadata
  - **Worker Nodes** - run the applications using images from runtimes like Docker
    - **Kubelet** - ensures containers are running properly in a pod
    - **Kube-Proxy** - acts as a network proxy between the user and the nodes
    - **Container Runtime Interface** - manages the execution and lifecycle of containers

In addition to the above architecture, there are other features of Kubernetes that make it flexible and extensible. One feature is the use of services across pods. You can imagine that for a large application with many different endpoints, services, and components, there may be overlap between what needs to be separated into pods and what needs to be grouped into a single endpoint. Kubernetes services allow multiple pods to be combined into one service that can expose an endpoint. (1) This allows for decoupling and modularity, which are good general software princples to follow.

## Significance in Dev Ops

It isn't hard to see the benefits of using Kubernetes from a Dev Ops viewpoint. Especially for large enterprise-level software, being able to scale and port your application easily and quickly is essential. Now that containerization has become more widely used, Kubernetes is also used more. With Kubernetes, applications can run containers with control over how to scale them, how many replicas to include for integrity, how to group containers in services, and how to spin up new or additional containers when problems arise with existing containers.

The management of Kubernetes can be quite involved and complex. To solve this complexity issue and help automate the system even further, cloud providers like AWS, Google, and Azure offer managed services. Each of these allow a user to worry less about configuring the control plane, managing scaling, etc while still retaining control over nodes and container workloads.

## Learning and Getting Started

It's easy to get started with Kubernetes and learn the ropes since there is much documentation and helpful resources. One open source, light weight version of Kubernetes meant to be used locally for learning and experimentation is minikube. The only prerequisites are having a Docker container and installing kubectl (a command-line tool for Kubernetes).

After installing minikube, you can run the following commands to perform various actions.

**Create a cluster**

```bash
minikube start
```

**Open the dashboard**

```bash
minikube dashboard
```

**Create a deployment**

```bash
kubectl create deployment hello-node --image=registry.k8s.io/e2e-test-images/agnhost:2.53 -- /agnhost netexec --http-port=8080
```

"A Kubernetes Deployment checks on the health of your Pod and restarts the Pod's Container if it terminates. Deployments are the recommended way to manage the creation and scaling of Pods." (5)

**View deployments**

```bash
kubectl get deployments
```

**View pods**

```bash
kubectl get pods
```

The previous minikube instructions are found at minikube.sigs.k8s.io. (5)

### References

(1) [kubernetes.io](https://kubernetes.io)

(2) [cncf.io](https://www.cncf.io/reports/kubernetes-project-journey-report/)

(3) [imb.com](https://www.ibm.com/think/topics/kubernetes-history)

(4) [sentinelone.com](https://www.sentinelone.com/cybersecurity-101/cybersecurity/eks-vs-aks-vs-gke/)

(5) [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/docs/start/)
